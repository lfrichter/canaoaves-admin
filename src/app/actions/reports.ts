"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

const supabase = createSupabaseServiceRoleClient();

export async function resolveReport(reportId: string) {
  const { data, error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function ignoreReport(reportId: string) {
  const { data, error } = await supabase
    .from("reports")
    .update({ status: "ignored" })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
