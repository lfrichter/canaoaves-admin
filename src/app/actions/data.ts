"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function getList(resource: string, params: any) {
  const supabase = createSupabaseServiceRoleClient();
  const {
    current = 1,
    pageSize = 10,
    filters = [],
    sorters = [],
  } = params;

  let query: any = supabase.from(resource).select("*", { count: "exact" });

  // Apply filters
  filters.forEach((filter: any) => {
    if (filter.operator === "eq") {
      query = query.eq(filter.field, filter.value);
    }
    // Add more filter operators as needed
  });

  // Apply sorters
  sorters.forEach((sorter: any) => {
    query = query.order(sorter.field, { ascending: sorter.order === "asc" });
  });

  const start = (current - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,
    total: count,
  };
}

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
