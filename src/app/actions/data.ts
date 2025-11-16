"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function getList(resource: string, params: any) {
  console.log("Server Action getList params:", params);
  const supabase = createSupabaseServiceRoleClient();

  const {
    current = 1,
    pageSize = 10,
    filters = [],
    sorters = [],
    meta,
  } = params;

  // Interceptação 'reports' (Existente)
  if (resource === "reports") {
    console.log("[getList Action] Interceptando 'reports'. Chamando RPC 'get_pending_reports_with_details'.");
    const { data, error } = await supabase.rpc("get_pending_reports_with_details", { p_page_size: pageSize, p_current_page: current });
    if (error) { console.error(`[getList Action] RPC Error:`, error); throw error; }
    const total = data.length > 0 ? data[0].total_count : 0;
    return { data, total: total };
  }

  // Interceptação 'city_descriptions' (Existente)
  if (resource === "city_descriptions") {
    console.log("[getList Action] Interceptando 'city_descriptions'. Chamando RPC 'get_pending_city_descriptions'.");
    const { data, error } = await supabase.rpc("get_pending_city_descriptions", { p_page_size: pageSize, p_current_page: current });
    if (error) { console.error(`[getList Action] RPC Error:`, error); throw error; }
    const total = data.length > 0 ? data[0].total_count : 0;
    return { data, total: total };
  }

  // Interceptação 'city_images' (Existente)
  if (resource === "city_images") {
    console.log("[getList Action] Interceptando 'city_images'. Chamando RPC 'get_pending_city_images'.");
    const { data, error } = await supabase.rpc("get_pending_city_images", { p_page_size: pageSize, p_current_page: current });
    if (error) { console.error(`[getList Action] RPC Error:`, error); throw error; }
    const total = data.length > 0 ? data[0].total_count : 0;
    return { data, total: total };
  }

  // --- MUDANÇA: ADICIONAR INTERCEPTAÇÃO PARA 'state_descriptions' ---
  if (resource === "state_descriptions") {
    console.log("[getList Action] Interceptando 'state_descriptions'. Chamando RPC 'get_pending_state_descriptions'.");

    const { data, error } = await supabase.rpc(
      "get_pending_state_descriptions",
      {
        p_page_size: pageSize,
        p_current_page: current,
      }
    );
    if (error) { console.error(`[getList Action] RPC Error:`, error); throw error; }
    const total = data.length > 0 ? data[0].total_count : 0;
    return { data, total: total };
  }
  // --- Fim da nova interceptação ---

  // Comportamento padrão para todos os outros recursos
  try {
    const selectQuery = meta?.select ? meta.select : "*";
    let query: any = supabase
      .from(resource)
      .select(selectQuery, { count: "exact" });

    filters.forEach((filter: any) => {
      if (filter.operator === "eq") { query = query.eq(filter.field, filter.value); }
    });
    sorters.forEach((sorter: any) => {
      query = query.order(sorter.field, { ascending: sorter.order === "asc" });
    });

    const start = (current - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) { throw error; }
    return { data, total: count };

  } catch (err: any) {
    console.error(`[getList Action] CRASH CRÍTICO para recurso ${resource}:`, err.message);
    return Promise.reject(err);
  }
}

// ... (o resto das suas Server Actions: getOne, create, update, etc.)
export async function getOne(resource: string, id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).select("*").eq("id", id).single();
  if (error) { throw error; }
  return { data };
}
export async function create(resource: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).insert(variables).select().single();
  if (error) { throw error; }
  return { data };
}
export async function update(resource: string, id: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).update(variables).eq("id", id).select().single();
  if (error) { throw error; }
  return { data };
}
export async function deleteOne(resource: string, id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from(resource).delete().eq("id", id);
  if (error) { throw error; }
  return { data: { id } };
}
