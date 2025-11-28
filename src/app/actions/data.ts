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

    if (typeof params !== "object" || params === null) {
      throw new Error("Invalid params provided.");
    }

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

    const hasActiveFilters = filters.length > 0 || !!searchQuery;

    // --- INTERCEPTAÇÕES DE RPC (Mantidas) ---
    if (resource === "reports") {
      const { data, error } = await supabase.rpc(
        "get_pending_reports_with_details",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) throw error;
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    if (resource === "city_descriptions") {
      const { data, error } = await supabase.rpc(
        "get_pending_city_descriptions",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) throw error;
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    if (resource === "city_images") {
      const { data, error } = await supabase.rpc("get_pending_city_images", {
        p_page_size: pageSize,
        p_current_page: current,
      });
      if (error) throw error;
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    if (resource === "state_descriptions") {
      const { data, error } = await supabase.rpc(
        "get_pending_state_descriptions",
        { p_page_size: pageSize, p_current_page: current }
      );
      if (error) throw error;
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    // --- PERFIS (Lógica Híbrida) ---
    if (resource === "profiles" && !hasActiveFilters) {
      console.log("[getList] Perfis sem filtro -> Usando RPC");
      const { data, error } = await supabase.rpc("get_profiles_with_users", {
        p_page_size: pageSize,
        p_current_page: current,
      });
      if (error) throw error;
      const total = data.length > 0 ? data[0].total_count : 0;
      return { data, total: total };
    }

    // --- QUERY BUILDER PADRÃO ---

    const selectQuery = meta?.select ? meta.select : "*";

    let query: any = supabase
      .from(resource as TableName)
      .select(selectQuery, { count: "exact" });

    // 1. Aplica filtros do Refine
    // Definimos uma flag para saber se a busca textual já foi aplicada via filters
    let searchHandledByFilters = false;

    if (filters.length > 0) {
      filters.forEach((filter: CrudFilter) => {
        if ("field" in filter) {
          if (filter.operator === "contains" || filter.operator === "ncontains") {
            searchHandledByFilters = true;
          }

          switch (filter.operator) {
            case "eq":
              query = query.eq(filter.field, filter.value);
              break;
            case "ne":
              query = query.neq(filter.field, filter.value);
              break;
            case "contains":
              query = query.ilike(filter.field, `%${filter.value}%`);
              break;
            case "ncontains":
              query = query.not("ilike", filter.field, `%${filter.value}%`);
              break;
            case "gt":
              query = query.gt(filter.field, filter.value);
              break;
            case "gte":
              query = query.gte(filter.field, filter.value);
              break;
            case "lt":
              query = query.lt(filter.field, filter.value);
              break;
            case "lte":
              query = query.lte(filter.field, filter.value);
              break;
            case "in":
              query = query.in(filter.field, filter.value);
              break;
          }
        }
      });
    }

    // 2. Aplica SearchQuery legado (apenas se filters NÃO tratou a busca)
    // [CORREÇÃO APLICADA AQUI]
    if (searchQuery && !searchHandledByFilters) {
       let field = meta?.searchField;

       // Se o campo não foi especificado no meta, determinamos automaticamente
       if (!field) {
         switch (resource) {
            case "profiles":
                field = "full_name"; // <--- O ERRO ESTAVA AQUI (era 'name')
                break;
            case "users": // Exemplo hipotético
                field = "email";
                break;
            default:
                field = "name"; // Padrão para services, categories, etc.
         }
       }

       query = query.ilike(field, `%${searchQuery}%`);
    }

    // 3. Aplica Ordenação
    if (sorters.length > 0) {
      sorters.forEach((sorter: any) => {
        query = query.order(sorter.field, { ascending: sorter.order === "asc" });
      });
    } else {
        query = query.order("id", { ascending: true });
    }

    // 4. Aplica Paginação
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
    console.error(`[getList Action] CRASH:`, err);
    return Promise.reject(err);
  }
}
