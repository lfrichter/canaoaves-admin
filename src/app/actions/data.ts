"use server";

import { CrudFilter } from "@refinedev/core";
import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { validateResource } from "@utils/validation/server";
import { revalidatePath } from "next/cache";
import { TableName } from "../../types/app";


export async function getList(resource: string, params: any) {
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
    } = params;

    const current = Number(rawCurrent) || 1;
    const pageSize = Number(rawPageSize) || 10;
    const { searchQuery = "" } = meta;

    // --- DEFINIÇÃO DO ALVO (TABELA OU VIEW) ---
    // Se for 'profiles', lemos da view que já tem o e-mail.
    // Para escrita (create/update), continuamos usando a tabela 'profiles' original.
    let targetTable = resource;
    if (resource === "profiles") {
      targetTable = "profile_users";
    }

    // --- INTERCEPTAÇÕES DE RPC (Mantidas para casos específicos) ---
    // ... (Mantendo as outras interceptações que você já tinha e funcionam)
    if (resource === "reports") {
      const { data, error } = await supabase.rpc(
        "get_pending_reports_with_details",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) throw error;
      return { data, total: data.length > 0 ? data[0].total_count : 0 };
    }

    if (resource === "city_descriptions") {
      targetTable = "view_admin_city_descriptions";
    }

    if (resource === "state_descriptions") {
      targetTable = "view_admin_state_descriptions";
    }

    if (resource === "city_images") {
      targetTable = "view_admin_city_images";
    }

    if (resource === "comments") {
      targetTable = "view_admin_comments";
    }

    if (resource === "photos") {
      targetTable = "view_admin_photos";
    }

    if (resource === "service_ownership_claims") {
      targetTable = "view_admin_service_claims";
    }
    // ... (Repita para city_descriptions, city_images, state_descriptions se necessário)

    // --- QUERY BUILDER PADRÃO ---
    // Agora funciona para Profiles também, pois a View age como uma tabela normal!

    const selectQuery = meta?.select ? meta.select : "*";

    // Usamos 'any' aqui para permitir tabelas/views dinâmicas
    let query: any = supabase
      .from(targetTable as any)
      .select(selectQuery, { count: "exact" });

    // 1. Aplica filtros do Refine
    let searchHandledByFilters = false;

    if (filters.length > 0) {
      filters.forEach((filter: CrudFilter) => {
        if ("field" in filter) {
          if (filter.operator === "contains" || filter.operator === "ncontains") {
            searchHandledByFilters = true;
          }
          switch (filter.operator) {
            case "eq": query = query.eq(filter.field, filter.value); break;
            case "ne": query = query.neq(filter.field, filter.value); break;
            case "contains": query = query.ilike(filter.field, `%${filter.value}%`); break;
            case "ncontains": query = query.not("ilike", filter.field, `%${filter.value}%`); break;
            // ... outros operadores
          }
        }
      });
    }

    // 2. Aplica SearchQuery legado (Fallback)
    if (searchQuery && !searchHandledByFilters) {
       let field = meta?.searchField;
       if (!field) {
         // O 'field' padrão para profiles agora pode ser full_name ou email,
         // pois a view tem os dois!
         switch (resource) {
            case "profiles": field = "full_name"; break;
            case "comments": field = "content"; break;
            case "photos": field = "caption"; break;
            default: field = "name";
         }
       }
       query = query.ilike(field, `%${searchQuery}%`);
    }

    // 3. Ordenação
    if (sorters.length > 0) {
      sorters.forEach((sorter: any) => {
        query = query.order(sorter.field, { ascending: sorter.order === "asc" });
      });
    } else {
        query = query.order("id", { ascending: true });
    }

    // 4. Paginação
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

const ID_COLUMNS: Record<string, string> = {
  profiles: "user_id",
};

// getOne: Também pode se beneficiar da View!
export async function getOne(resource: string, { id }: { id: string }) {
  await verifyUserRole(["admin", "master"]);

  // Guarda contra IDs inválidos/nulos/"undefined"
  if (!id || id === "undefined" || id === "null") {
    console.warn(`getOne abortado: ID inválido (${id}) para recurso ${resource}`);
    return { data: null };
  }

  validateResource(resource);
  const idColumn = ID_COLUMNS[resource] || "id";
  const supabase = createSupabaseServiceRoleClient();

  // Se for profile, buscamos da view para já vir com o e-mail
  let targetTable = resource;
  if (resource === "profiles") {
      targetTable = "profile_users";
  }

  const query = supabase
  .from(targetTable as any)
  .select("*")
  .eq(idColumn, id);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error(`Erro em getOne para ${resource}:`, error);
    throw new Error(error.message);
  }

  return { data };
}

// =========================================================
// CREATE
// =========================================================
export async function create(resource: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  if (resource === "profiles") {
    await verifyUserRole(["master"]);

    // [SANITIZAÇÃO] Remove campos que vêm da View (auth.users) mas não existem na Tabela (profiles)
    delete variables.email;
    delete variables.email_confirmed_at;
    delete variables.user_deleted_at;
    delete variables.banned_until;

    // Opcional: remover timestamps se o banco gera automaticamente (boa prática)
    // delete variables.created_at;
    // delete variables.updated_at;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource as TableName)
    .insert(variables)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/${resource}`);

  return { data };
}

// =========================================================
// UPDATE
// =========================================================
export async function update(resource: string, id: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  if (resource === "profiles") {
    await verifyUserRole(["master"]);

    // [SANITIZAÇÃO] Remove campos que vêm da View (auth.users) mas não existem na Tabela (profiles)
    // Se não removermos, o Supabase dá erro PGRST204 pois tenta atualizar colunas inexistentes.
    delete variables.email;
    delete variables.email_confirmed_at;
    delete variables.user_deleted_at;
    delete variables.banned_until;

    // Opcional: remover timestamps para evitar conflitos
    // delete variables.created_at;
    // delete variables.updated_at;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource as TableName)
    .update(variables)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/${resource}`);

  return { data };
}

// =========================================================
// DELETE (Com lógica de Soft Delete para Perfis)
// =========================================================
export async function deleteOne(resource: string, id: string) {
  // 1. Verificação de Segurança
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  // Para deletar usuários/perfis, exigimos role Master por segurança
  if (resource === "profiles") {
    await verifyUserRole(["master"]);
  }

  const supabase = createSupabaseServiceRoleClient();

  try {
    // ---------------------------------------------------------
    // CASO ESPECIAL: PROFILES (Soft Delete + Banimento)
    // ---------------------------------------------------------
    if (resource === "profiles") {
      // 1. Buscamos o user_id (que está na tabela profiles) baseado no ID do registro
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError || !profile) {
        throw new Error("Perfil não encontrado para exclusão.");
      }

      // 2. Soft Delete no Perfil (marca deleted_at)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      // 3. Banir o usuário no Supabase Auth (Camada de Identidade)
      // Isso impede que ele faça login novamente, mesmo que o registro exista.
      const { error: banError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { ban_duration: "876000h" } // Banido por ~100 anos
      );

      if (banError) {
        console.error("Erro ao banir usuário no Auth:", banError);
        // Não lançamos erro aqui para não reverter o soft delete, mas logamos.
      }

      revalidatePath(`/${resource}`);
      return { data: { id } };
    }

    // ---------------------------------------------------------
    // CASO PADRÃO: HARD DELETE (Outros recursos)
    // ---------------------------------------------------------
    // Para comments, photos, etc., continuamos com Hard Delete
    // até que o schema suporte 'status' ou 'deleted_at' para eles.
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
// CUSTOM (Para rotas manuais como Restore)
// =========================================================
export async function custom(data: any) {
  // 1. Verificação de Segurança
  await verifyUserRole(["admin", "master"]);

  const { url, method, values: payload } = data; // O Refine envia 'values' ou 'payload' dependendo da versão
  const supabase = createSupabaseServiceRoleClient();

  // 2. Parser da URL
  // A URL vem como "undefined/profiles/ID" ou "http://.../profiles/ID"
  // Vamos pegar as duas últimas partes: recurso e ID.
  const parts = url.split("/");
  const id = parts.pop(); // Última parte: ID
  const resource = parts.pop(); // Penúltima parte: Resource

  if (!id || !resource) {
    throw new Error("URL inválida para Custom Action.");
  }

  try {
    // ---------------------------------------------------------
    // LÓGICA DE RESTORE (PATCH em PROFILES)
    // ---------------------------------------------------------
    if (resource === "profiles" && method === "patch") {
      await verifyUserRole(["master"]);

      // A. Remove o banimento no Supabase Auth
      // Precisamos buscar o user_id primeiro
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (profile?.user_id) {
        const { error: unbanError } = await supabase.auth.admin.updateUserById(
          profile.user_id,
          { ban_duration: "0" } // Remove o banimento
        );
        if (unbanError) console.error("Erro ao remover ban:", unbanError);
      }

      // B. Remove o deleted_at na tabela (Restore)
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

    // ---------------------------------------------------------
    // FALLBACK GENÉRICO (Para outras tabelas simples)
    // ---------------------------------------------------------
    // Se não for profile, tenta apenas rodar o update com os valores passados
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
