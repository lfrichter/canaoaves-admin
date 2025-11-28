"use server";

import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { validateResource } from "@utils/validation/server";
import { TableName } from "../../types/app";

export async function getList(resource: string, params: any) {
  try {
    await verifyUserRole(["admin", "master"]);
    validateResource(resource);
    if (typeof params !== "object" || params === null) {
      throw new Error("Invalid params provided.");
    }

    console.log("Server Action getList params:", params);
    const supabase = createSupabaseServiceRoleClient();

    const {
      current: rawCurrent = 1,
      pageSize: rawPageSize = 10, // Renomeamos para "raw" (bruto)
      filters = [],
      sorters = [],
      meta = {},
    } = params;

    const current = Number(rawCurrent) || 1;
    const pageSize = Number(rawPageSize) || 10;

    // Interceptação 'reports' (Existente)
    if (resource === "reports") {
      console.log(
        "[getList Action] Interceptando 'reports'. Chamando RPC 'get_pending_reports_with_details'."
      );
      const { data, error } = await supabase.rpc(
        "get_pending_reports_with_details",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) {
        console.error(`[getList Action] RPC Error:`, error);
        throw error;
      }
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    // Interceptação 'city_descriptions' (Existente)
    if (resource === "city_descriptions") {
      console.log(
        "[getList Action] Interceptando 'city_descriptions'. Chamando RPC 'get_pending_city_descriptions'."
      );
      const { data, error } = await supabase.rpc(
        "get_pending_city_descriptions",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) {
        console.error(`[getList Action] RPC Error:`, error);
        throw error;
      }
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    // Interceptação 'city_images' (Existente)
    if (resource === "city_images") {
      console.log(
        "[getList Action] Interceptando 'city_images'. Chamando RPC 'get_pending_city_images'."
      );
      const { data, error } = await supabase.rpc("get_pending_city_images", {
        p_page_size: pageSize,
        p_current_page: current,
      });
      if (error) {
        console.error(`[getList Action] RPC Error:`, error);
        throw error;
      }
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    // --- MUDANÇA: ADICIONAR INTERCEPTAÇÃO PARA 'state_descriptions' ---
    if (resource === "state_descriptions") {
      console.log(
        "[getList Action] Interceptando 'state_descriptions'. Chamando RPC 'get_pending_state_descriptions'."
      );

      const { data, error } = await supabase.rpc(
        "get_pending_state_descriptions",
        {
          p_page_size: pageSize,
          p_current_page: current,
        }
      );

      if (error) {
        console.error(`[getList Action] RPC Error:`, error);
        throw error;
      }

      const total = data.length > 0 ? data[0].total_count : 0;

      return { data, total: total };
    }

    if (resource === "profiles") {
      console.log(
        "[getList Action] Interceptando 'profiles'. Chamando RPC 'get_profiles_with_users'."
      );

      const { data, error } = await supabase.rpc("get_profiles_with_users", {
        p_page_size: pageSize,
        p_current_page: current,
      });
      if (error) {
        console.error(`[getList Action] RPC Error:`, error);
        throw error;
      }
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }
    // --- Fim da nova interceptação ---

    // Comportamento padrão para todos os outros recursos
    const selectQuery = meta?.select ? meta.select : "*";

    let query: any = supabase
      .from(resource as TableName)
      .select(selectQuery, { count: "exact" });

    filters.forEach((filter: any) => {
      if (filter.operator === "eq") {
        query = query.eq(filter.field, filter.value);
      }
    });
    sorters.forEach((sorter: any) => {
      query = query.order(sorter.field, { ascending: sorter.order === "asc" });
    });

    const start = (current - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error("[getList Action] Erro do Supabase:", error);
      throw error;
    }
    return { data, total: count };
  } catch (err: any) {
    console.error(`[getList Action] CRASH CRÍTICO para recurso ${resource}:`, err);
    return Promise.reject(err);
  }
}

// ... (o resto das suas Server Actions: getOne, create, update, etc.)
export async function getOne(resource: string, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  if (typeof id !== "string") {
    throw new Error("Invalid ID provided.");
  }

  const supabase = createSupabaseServiceRoleClient();

  // --- INTERCEPTAÇÃO PARA PERFIS ---
  if (resource === "profiles") {
    console.log(`[getOne] 🟢 INTERCEPTANDO PERFIL: ID ${id}`);

    const { data, error } = await supabase.rpc("get_profile_by_id", { p_id: id });

    if (error) {
      console.error("[getOne] 🔴 ERRO NO RPC:", error);
      throw error;
    }

    // --- A MÁGICA ESTÁ AQUI ---
    // Se o objeto 'user' existir, movemos o email para a raiz.
    // Isso facilita a leitura pelo formulário no frontend.
    if (data && (data as any).user && (data as any).user.email) {
      (data as any).email = (data as any).user.email;
      console.log(
        `[getOne] 📧 E-mail extraído e injetado na raiz: ${
          (data as any).email
        }`
      );
    } else {
      console.log(
        `[getOne] ⚠️ Objeto 'user' ou 'email' não encontrado no retorno do RPC.`
      );
    }

    return { data };
  }
  // --- FIM DA INTERCEPTAÇÃO ---

  const { data, error } = await supabase
    .from(resource as TableName)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return {
    data,
  };
}
// ---
// FUNÇÕES DE ESCRITA (PERIGOSAS - Requerem lógica granular)
// ---

export async function create(resource: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  if (typeof variables !== "object" || variables === null) {
    throw new Error("Invalid variables provided.");
  }

  // --- LÓGICA DE SEGURANÇA GRANULAR ---
  // Apenas 'master' pode criar novos perfis.
  if (resource === "profiles") {
    await verifyUserRole(["master"]);
  } else {
    // Admins podem criar outros recursos (ex: categorias, serviços)
    await verifyUserRole(["admin", "master"]);
  }
  // --- FIM DA LÓGICA DE SEGURANÇA ---

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource as TableName)
    .insert(variables)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return { data };
}
export async function update(resource: string, id: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  if (typeof id !== "string") {
    throw new Error("Invalid ID provided.");
  }
  if (typeof variables !== "object" || variables === null) {
    throw new Error("Invalid variables provided.");
  }

  // --- LÓGICA DE SEGURANÇA GRANULAR ---
  // Apenas 'master' pode atualizar perfis (prevenindo escalonamento de privilégio).
  if (resource === "profiles") {
    await verifyUserRole(["master"]);
  } else {
    // Admins podem atualizar outros recursos
    await verifyUserRole(["admin", "master"]);
  }
  // --- FIM DA LÓGICA DE SEGURANÇA ---

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource as TableName)
    .update(variables)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return { data };
}
export async function deleteOne(resource: string, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  if (typeof id !== "string") {
    throw new Error("Invalid ID provided.");
  }

  // --- LÓGICA DE SEGURANÇA GRANULAR ---
  // Apenas 'master' pode deletar (é uma ação destrutiva).
  // Isto é especialmente crítico para 'profiles'.
  await verifyUserRole(["master"]);
  // --- FIM DA LÓGICA DE SEGURANÇA ---

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from(resource as TableName)
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
  return { data: { id } };
}

