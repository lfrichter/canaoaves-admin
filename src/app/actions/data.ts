// src/app/actions/data.ts

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

  // --- MUDANÇA: Interceptar 'reports' e usar a nova função RPC ---
  if (resource === "reports") {
    console.log(
      `[getList Action] Interceptando 'reports'. Chamando RPC 'get_pending_reports_with_details'.`
    );

    // O filtro 'status=pending' já está na função RPC,
    // então só precisamos passar a paginação.
    const { data, error } = await supabase.rpc(
      "get_pending_reports_with_details",
      {
        p_page_size: pageSize,
        p_current_page: current,
      }
    );

    if (error) {
      console.error(`[getList Action] RPC Error:`, error);
      throw error;
    }

    // A RPC retorna os dados e a contagem total em cada linha
    const total = data.length > 0 ? data[0].total_count : 0;

    return {
      data,
      total: total,
    };
  }
  // --- Fim da Interceptação ---

  // Comportamento padrão para todos os outros recursos
  try {
    const selectQuery = meta?.select ? meta.select : "*";

    let query: any = supabase
      .from(resource)
      .select(selectQuery, { count: "exact" });

    // Aplicar filtros
    filters.forEach((filter: any) => {
      if (filter.operator === "eq") {
        query = query.eq(filter.field, filter.value);
      }
      // Adicionar mais operadores de filtro se necessário
    });

    // Aplicar sorters
    sorters.forEach((sorter: any) => {
      query = query.order(sorter.field, { ascending: sorter.order === "asc" });
    });

    const start = (current - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);

    console.log(`[getList Action] Executando query para ${resource}...`);
    const { data, error, count } = await query;

    if (error) {
      console.error(`[getList Action] Erro do Supabase:`, error);
      throw error;
    }

    console.log(
      `[getList Action] Query bem-sucedida. Retornando ${data.length} registros, total ${count}.`
    );
    return {
      data,
      total: count,
    };
  } catch (err: any) {
    console.error(
      `[getList Action] CRASH CRÍTICO para recurso ${resource}:`,
      err.message
    );
    return Promise.reject(err);
  }
}

// ... (o resto das suas Server Actions: getOne, create, update, etc.)
export async function getOne(resource: string, id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return {
    data,
  };
}

export async function create(resource: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).insert(variables).select().single();

  if (error) {
    throw error;
  }

  return {
    data,
  };
}

export async function update(resource: string, id: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from(resource).update(variables).eq("id", id).select().single();

  if (error) {
    throw error;
  }

  return {
    data,
  };
}

export async function deleteOne(resource: string, id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from(resource).delete().eq("id", id);

  if (error) {
    throw error;
  }

  return {
    data: { id },
  };
}
