"use server";

import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function resolveReport(reportId: string) {
  await verifyUserRole(["admin", "master"]);
  if (typeof reportId !== "string") {
    throw new Error("Invalid report ID provided.");
  }
  const supabase = createSupabaseServiceRoleClient();
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
  await verifyUserRole(["admin", "master"]);
  if (typeof reportId !== "string") {
    throw new Error("Invalid report ID provided.");
  }
  const supabase = createSupabaseServiceRoleClient();
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
