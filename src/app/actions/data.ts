"use server";

import { CrudFilter } from "@refinedev/core";
import { verifyUserRole } from "@utils/auth/server"; // Apenas o que já existia
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { validateResource } from "@utils/validation/server";
import { revalidatePath } from "next/cache";
import { TableName } from "../../types/app";

// =========================================================
// GET LIST
// =========================================================
export async function getList(resource: string, params: any) {
  console.log(`[getList Action] Resource: ${resource}, Params:`, JSON.stringify(params, null, 2));

  try {
    await verifyUserRole(["admin", "master"]);
    validateResource(resource);

    const supabase = createSupabaseServiceRoleClient();

    const {
      current: rawCurrent = 1,
      pageSize: rawPageSize = 10,
      filters = [],
      sorters = [],
      meta = {},
      status: rootStatus,
    } = params;

    const current = meta?.current ? Number(meta.current) : (Number(rawCurrent) || 1);
    const pageSize = Number(rawPageSize) || 10;
    const { searchQuery = "" } = meta;

    // Tenta pegar o filtro de status de qualquer lugar possível
    // 1. Do meta (se enviado pelo frontend explicitamente)
    // 2. Da raiz (se veio via query string da URL)
    const statusFilter = meta?.statusFilter || meta?.status || rootStatus;

    // --- DEFINIÇÃO DO ALVO (TABELA OU VIEW) ---
    let targetTable = resource;
    if (resource === "profiles") {
      targetTable = "view_admin_profiles";
    }
    if (resource === "services") {
      targetTable = "view_admin_services";
    }

    // --- INTERCEPTAÇÕES DE RPC ---
    if (resource === "reports") {
      const { data, error } = await supabase.rpc(
        "get_pending_reports_with_details",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) throw error;
      return { data, total: data.length > 0 ? data[0].total_count : 0 };
    }

    // Mapeamento para Views Específicas
    if (resource === "city_descriptions") targetTable = "view_admin_city_descriptions";
    if (resource === "state_descriptions") targetTable = "view_admin_state_descriptions";
    if (resource === "city_images") targetTable = "view_admin_city_images";
    if (resource === "comments") targetTable = "view_admin_comments";
    if (resource === "photos") targetTable = "view_admin_photos";
    if (resource === "service_ownership_claims") targetTable = "view_admin_service_claims";
    if (resource === "categories") targetTable = "view_admin_categories_tree";

    const selectQuery = meta?.select ? meta.select : "*";

    let query: any = supabase
      .from(targetTable as any)
      .select(selectQuery, { count: "exact" });

    let activeFilters = filters;

    // Prioridade da Busca Global
    // Se houver busca global, removemos filtros de nome conflitantes da cópia
    if (searchQuery && activeFilters.length > 0) {
       activeFilters = activeFilters.filter((f: any) =>
          f.field !== 'name' &&
          f.field !== 'full_name' &&
          f.field !== 'public_name'
       );
    }

    // 1. Aplica filtros do Refine (use activeFilters)
    let searchHandledByFilters = false;

    if (activeFilters.length > 0) {
      activeFilters.forEach((filter: CrudFilter) => {
        if ("field" in filter) {
          // Proteção contra filtros inválidos
          if (
            filter.value === undefined ||
            filter.value === null ||
            filter.value === ""
          ) {
            return; // Pula este filtro
          }

          if (resource === 'profiles' && filter.field === 'status') return;

          // NOVO: Se há uma busca global (searchQuery), e o filtro atual é
          // um dos "campos fantasmas", então ignoramos este filtro específico do Refine.
          // O searchQuery já tratará a busca em texto nos campos relevantes.
          if (searchQuery) {
             const ghostFields = ['name', 'full_name', 'public_name', 'title', 'description', 'caption', 'content'];

             // Se for um desses campos, o searchQuery já vai cuidar, então ignorar o CrudFilter redundante.
             if (ghostFields.includes(filter.field)) {
                return;
             }
          }

          // [MANTIDO] Lógica Específica de Profiles (OR condition quando TEM busca)
          if (resource === "profiles" && filter.field === "name") {
             const val = filter.value;
             query = query.or(`full_name.ilike.%${val}%,public_name.ilike.%${val}%,email.ilike.%${val}%`);
             searchHandledByFilters = true;
             return;
          }

          if (filter.operator === "contains" || filter.operator === "ncontains") {
            searchHandledByFilters = true;
          }

          switch (filter.operator) {
            case "eq": query = query.eq(filter.field, filter.value); break;
            case "ne": query = query.neq(filter.field, filter.value); break;
            case "contains": query = query.ilike(filter.field, `%${filter.value}%`); break;
            case "ncontains": query = query.not("ilike", filter.field, `%${filter.value}%`); break;
            // ... adicione outros operadores se necessário (gt, lt, etc)
          }
        }
      });
    }

    // =========================================================
    // 2. BUSCA - Aplica Busca Textual
    // =========================================================
    if (searchQuery && !searchHandledByFilters) {

       // CASO ESPECIAL: PROFILES (Busca em múltiplos campos)
       if (resource === "profiles") {
         // O operador .or() permite buscar em várias colunas ao mesmo tempo
         query = query.or(`full_name.ilike.%${searchQuery}%,public_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
       }

       // CASO ESPECIAL: CIDADES (Busca nome ou estado)
       else if (resource === "cities") {
         query = query.or(`name.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`);
       }

       // OUTROS RECURSOS (Lógica padrão com proteção)
       else {
         let field = meta?.searchField;

         if (!field) {
           switch (resource) {
              case "comments": field = "content"; break;
              case "photos": field = "caption"; break;
              case "services": field = "name"; break;
              case "categories": field = "name"; break;
              // Adicione mais casos conforme necessário
              default: field = "id"; // Fallback seguro (ID sempre existe) para não quebrar
           }
         }

         // Só aplica o filtro se tivermos um campo válido
         if (field) {
            // Se for ID, precisa ser busca exata e verificar se é UUID válido
            if (field === 'id') {
               // Ignora busca textual em ID para evitar erro de sintaxe UUID
            } else {
               query = query.ilike(field, `%${searchQuery}%`);
            }
         }
       }
    }

    // =========================================================
    // 3. FILTRO DE STATUS (Via Meta)
    // =========================================================

    // A. SERVIÇOS APENAS: Filtra pela coluna 'status'
    if (resource === 'services') {
       if (statusFilter && statusFilter !== "all") {
         query = query.eq('status', statusFilter);
       }
    }

    // B. PERFIS APENAS: Filtra pela coluna 'deleted_at'
    if (resource === 'profiles') {
       // Pega o status enviado. SE NÃO TIVER NADA, ASSUME 'active' (Padrão)
       const rawStatus = meta?.userStatus || meta?.status || rootStatus || 'active';
       const finalStatus = String(rawStatus).toLowerCase();

       if (finalStatus === 'active') {
         // Padrão: Apenas ativos (deleted_at IS NULL)
         query = query.is('deleted_at', null);
       }
       else if (finalStatus === 'deleted') {
         // Apenas excluídos
         query = query.not('deleted_at', 'is', null);
       }
       // Se for 'all', não entra em nenhum if e retorna tudo.
    }

    // =========================================================
    // 4. Ordenação
    // =========================================================
    if (sorters.length > 0) {
      sorters.forEach((sorter: any) => {
        // Se a ordenação vier do frontend, respeita
        query = query.order(sorter.field, { ascending: sorter.order === "asc" });
      });
    } else {
        // [CORREÇÃO] Ordenação Padrão por Recurso
        if (resource === "categories") {
            // A view de árvore DEVE ser ordenada por path_ids para manter a hierarquia
            query = query.order("path_ids", { ascending: true });
        } else {
            // Padrão para outros recursos
            query = query.order("id", { ascending: true });
        }
    }

    // =========================================================
    // 5. Paginação
    // =========================================================
    const start = (current - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) throw error;

    return { data, total: count };

  } catch (err: any) {
    console.error(`[getList Action] CRASH:`, err);
    return Promise.reject(err);
  }
}

// =========================================================
// GET ONE
// =========================================================
const ID_COLUMNS: Record<string, string> = {
  // profiles: "user_id",
};

export async function getOne(
  resource: string,
  { id, meta }: { id: string; meta?: any }
) {
  await verifyUserRole(["admin", "master"]);

  if (!id || id === "undefined" || id === "null") {
    console.warn(`getOne abortado: ID inválido (${id}) para recurso ${resource}`);
    return { data: null };
  }

  validateResource(resource);
  const idColumn = meta?.idColumn || ID_COLUMNS[resource] || "id";
  const supabase = createSupabaseServiceRoleClient();

  let targetTable = resource;
  if (resource === "profiles") targetTable = "view_admin_profiles";
  if (resource === "services") targetTable = "view_admin_services";

  // [CORREÇÃO CRÍTICA PARA BUILD]
  // O TypeScript entrava em loop infinito tentando inferir tipos aqui.
  // Forçamos 'any' no queryBuilder para quebrar a análise estática profunda.
  const queryBuilder: any = supabase.from(targetTable as any);

  const { data, error } = await queryBuilder
    .select("*")
    .eq(idColumn, id)
    .maybeSingle();

  if (error) {
    console.error(`Erro em getOne para ${resource}:`, error);
    throw new Error(error.message);
  }

  return { data };
}

async function uploadServiceImage(
  supabaseService: any,
  photoData: any,
  serviceIdPrefix: string = 'new'
): Promise<string | null> {

  // 1. Sanitização: Se vier como string JSON, faz o parse
  if (typeof photoData === 'string' && photoData.trim().startsWith('{')) {
    try {
      photoData = JSON.parse(photoData);
    } catch (e) {
      console.warn("Falha ao parsear JSON da imagem, ignorando.", e);
      return null;
    }
  }

  // 2. Validação: Verifica se é um objeto de imagem válido vindo do componente
  if (typeof photoData === 'object' && photoData !== null && photoData.base64) {
    try {
      // Extrai o base64 puro (remove "data:image/png;base64,")
      const base64Content = photoData.base64.split(',')[1] || photoData.base64;
      const fileBuffer = Buffer.from(base64Content, 'base64');

      // Define extensão e nome
      const fileType = photoData.type || 'image/jpeg';
      const fileExtension = fileType.split('/')[1] || 'jpg';

      // Caminho no bucket 'photos'
      // Ex: admin-uploads/service-123-featured-17150000.jpg
      const fileName = `service-${serviceIdPrefix}-featured-${Date.now()}.${fileExtension}`;
      const filePath = `admin-uploads/${fileName}`;

      // 3. Upload para o bucket 'photos'
      const { error: uploadError } = await supabaseService.storage
        .from("photos") // <--- BUCKET CORRETO
        .upload(filePath, fileBuffer, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Erro Supabase Storage:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 4. Obter URL Pública
      const { data: publicUrlData } = supabaseService.storage
        .from("photos")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;

    } catch (e: any) {
      console.error("Falha crítica no processamento da imagem:", e);
      throw e; // Lança o erro para o usuário ver
    }
  }

  return null; // Não era uma imagem nova, retorna null
}

// =========================================================
// CREATE
// =========================================================
export async function create(resource: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  const supabase = createSupabaseServiceRoleClient();

  // --- LÓGICA DE UPLOAD (CREATE) ---
  if (resource === "services" && variables.featured_photo_url) {
    const publicUrl = await uploadServiceImage(supabase, variables.featured_photo_url, crypto.randomUUID());

    if (publicUrl) {
      variables.featured_photo_url = publicUrl;
    } else {
      // Se não conseguiu processar (ex: não era base64 válido), remove o campo para não dar erro
      delete variables.featured_photo_url;
    }
  }

  // Sanitização de Profiles
  if (resource === "profiles") {
    // Sanitização de View
    delete variables.email;
    delete variables.email_confirmed_at;
    delete variables.user_deleted_at;
    delete variables.banned_until;
    // Campos da nova view
    delete variables.city_name;
    delete variables.city_state;
    delete variables.category_name;
    delete variables.category_icon;
    delete variables.total_likes_received;
    delete variables.total_services_owned;
    delete variables.total_services_indicated;
    delete variables.total_confirmations_made;
    delete variables.total_comments_made;
    delete variables.recent_owned_services;
    delete variables.recent_indicated_services;
    delete variables.recent_comments;
  }

  const { data, error } = await supabase
    .from(resource as TableName)
    .insert(variables)
    .select()
    .single();

  if (error) {
    console.error("Supabase Insert Error:", error);
    throw error;
  }

  revalidatePath(`/${resource}`);
  return { data };
}

// =========================================================
// UPDATE
// =========================================================
export async function update(resource: string, id: string, variables: any) {
  // 1. Permite entrada para Admin e Master
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  const supabaseService = createSupabaseServiceRoleClient();

  // --- LÓGICA DE UPLOAD (UPDATE) ---
  if (resource === "services" && variables.featured_photo_url) {
    const publicUrl = await uploadServiceImage(supabaseService, variables.featured_photo_url, id);

    if (publicUrl) {
      variables.featured_photo_url = publicUrl;
    } else {
       // Se retornou null, significa que não é uma NOVA imagem base64.
       // Pode ser que o usuário não trocou a imagem (manteve a URL antiga string).
       // Nesse caso, verificamos: se for objeto inválido, deleta. Se for string URL, mantém.
       if (typeof variables.featured_photo_url === 'object') {
          delete variables.featured_photo_url;
       }
    }
  }

  // 2. Descobre se é Master usando a própria função de verificação
  let isMaster = false;
  try {
    // Se passar sem erro, é master
    await verifyUserRole(["master"]);
    isMaster = true;
  } catch {
    // Se der erro, é admin (pois já passou no check acima)
    isMaster = false;
  }

  if (resource === "profiles") {
    // [SEGURANÇA] Se não for Master, remove campos sensíveis
    if (!isMaster) {
        delete variables.app_role;
        delete variables.score;
    }

    // [SANITIZAÇÃO DE VIEW] Remove campos extras
    delete variables.email;
    delete variables.email_confirmed_at;
    delete variables.user_deleted_at;
    delete variables.banned_until;
    delete variables.last_sign_in_at;
    delete variables.city_name;
    delete variables.city_state;
    delete variables.category_name;
    delete variables.category_icon;
    delete variables.total_likes_received;
    delete variables.total_services_owned;
    delete variables.total_services_indicated;
    delete variables.total_confirmations_made;
    delete variables.total_comments_made;
    delete variables.recent_owned_services;
    delete variables.recent_indicated_services;
    delete variables.recent_comments;
  }

  const { data, error } = await supabaseService
    .from(resource as TableName)
    .update(variables)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase Update Error:", error);
    throw error;
  }

  revalidatePath(`/${resource}`);
  return { data };
}

// =========================================================
// DELETE
// =========================================================
export async function deleteOne(resource: string, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  const supabase = createSupabaseServiceRoleClient();

  try {
    if (resource === "profiles") {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError || !profile) {
        throw new Error("Observador não encontrado para exclusão.");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      const { error: banError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { ban_duration: "876000h" }
      );

      if (banError) console.error("Erro ao banir usuário no Auth:", banError);

      revalidatePath(`/${resource}`);
      return { data: { id } };
    }

    const { error } = await supabase
      .from(resource as TableName)
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath(`/${resource}`);
    return { data: { id } };

  } catch (err: any) {
    console.error(`[deleteOne Action] CRASH:`, err);
    return Promise.reject(err);
  }
}

// =========================================================
// CUSTOM (Restore)
// =========================================================
export async function custom(data: any) {
  await verifyUserRole(["admin", "master"]);

  const { url, method, values: payload } = data;
  const supabase = createSupabaseServiceRoleClient();

  const parts = url.split("/");
  const id = parts.pop();
  const resource = parts.pop();

  if (!id || !resource) {
    throw new Error("URL inválida para Custom Action.");
  }

  try {
    if (resource === "profiles" && method === "patch") {
      // Restore: Apenas Master e Admin
      await verifyUserRole(["admin", "master"]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (profile?.user_id) {
        const { error: unbanError } = await supabase.auth.admin.updateUserById(
          profile.user_id,
          { ban_duration: "0" }
        );
        if (unbanError) console.error("Erro ao remover ban:", unbanError);
      }

      const { data: updatedData, error: updateError } = await supabase
        .from("profiles")
        .update({ deleted_at: null })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      revalidatePath(`/${resource}`);
      return { data: updatedData };
    }

    if (method === "patch" || method === "put") {
      const { data: genericData, error: genericError } = await supabase
        .from(resource)
        .update(payload || {})
        .eq("id", id)
        .select()
        .single();

      if (genericError) throw genericError;

      revalidatePath(`/${resource}`);
      return { data: genericData };
    }

    throw new Error(`Rota customizada não implementada para: ${method} ${resource}`);

  } catch (err: any) {
    console.error(`[custom Action] CRASH:`, err);
    return Promise.reject(err);
  }
}


export const getMany = async (resource: string, ids: string[]) => {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from(resource as any)
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data || [],
  };
};
