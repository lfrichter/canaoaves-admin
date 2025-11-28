"use server";

import { CrudFilter } from "@refinedev/core";
import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { validateResource } from "@utils/validation/server";
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

// getOne: Também pode se beneficiar da View!
export async function getOne(resource: string, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);

  const supabase = createSupabaseServiceRoleClient();

  // Se for profile, buscamos da view para já vir com o e-mail
  let targetTable = resource;
  if (resource === "profiles") {
      targetTable = "profile_users";
  }

  const { data, error } = await supabase
    .from(targetTable as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return { data };
}

// create, update, deleteOne CONTINUAM IGUAIS (escrevendo na tabela 'profiles')
export async function create(resource: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  if (resource === "profiles") await verifyUserRole(["master"]);

  const supabase = createSupabaseServiceRoleClient();
  // ESCRITA: Sempre na tabela original (resource), nunca na view
  const { data, error } = await supabase
    .from(resource as TableName)
    .insert(variables)
    .select()
    .single();

  if (error) throw error;
  return { data };
}

export async function update(resource: string, id: string, variables: any) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  if (resource === "profiles") await verifyUserRole(["master"]);

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource as TableName)
    .update(variables)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return { data };
}

export async function deleteOne(resource: string, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateResource(resource);
  await verifyUserRole(["master"]);

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from(resource as TableName)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { data: { id } };
}
