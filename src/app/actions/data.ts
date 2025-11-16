"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function getList(resource: string, params: any) {
  // --- DEBUGGING ---
  console.log(`[getList Action] CHAMADO para recurso: ${resource}`);

  let selectQuery = "*"; // Padrão

  try {
    const {
      current = 1,
      pageSize = 10,
      filters = [],
      sorters = [],
      meta, // Nós esperamos por isso
    } = params;

    console.log(`[getList Action] Params processados. Meta recebido: ${JSON.stringify(meta)}`);

    // Determina a query de select
    if (meta && meta.select) {
      selectQuery = meta.select;
      console.log(`[getList Action] Usando meta.select: ${selectQuery}`);
    } else {
      console.log(`[getList Action] Nenhum meta.select encontrado, usando padrão: "*"`);
    }

    const supabase = createSupabaseServiceRoleClient();
    let query: any = supabase
      .from(resource)
      .select(selectQuery, { count: "exact" });

    // Aplicar filtros
    filters.forEach((filter: any) => {
      if (filter.operator === "eq") {
        query = query.eq(filter.field, filter.value);
      }
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

    console.log(`[getList Action] Query bem-sucedida. Retornando ${data.length} registros, total ${count}.`);
    return {
      data,
      total: count,
    };

  } catch (err: any) {
    console.error(`[getList Action] CRASH CRÍTICO para recurso ${resource}:`, err.message);
    // Retorna uma estrutura de erro que o Refine pode entender
    return Promise.reject(err);
  }
}

// ... (o resto do seu arquivo getOne, create, update, etc. fica aqui)

export async function getOne(resource: string, id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource)
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

export async function create(resource: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource)
    .insert(variables)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    data,
  };
}

export async function update(resource: string, id: string, variables: any) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource)
    .update(variables)
    .eq("id", id)
    .select()
    .single();

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
