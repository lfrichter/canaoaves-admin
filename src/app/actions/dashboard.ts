"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export interface DashboardStats {
  pending_claims: number;
  pending_reports: number;
  unapproved_city_descriptions: number;
  unapproved_city_images: number;
  unapproved_state_descriptions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const [
      { count: pending_claims },
      { count: pending_reports },
      { count: unapproved_city_descriptions },
      { count: unapproved_city_images },
      { count: unapproved_state_descriptions },
    ] = await Promise.all([
      supabase
        .from("service_ownership_claims")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("city_descriptions")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("city_images")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("state_descriptions")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
    ]);

    return {
      pending_claims: pending_claims ?? 0,
      pending_reports: pending_reports ?? 0,
      unapproved_city_descriptions: unapproved_city_descriptions ?? 0,
      unapproved_city_images: unapproved_city_images ?? 0,
      unapproved_state_descriptions: unapproved_state_descriptions ?? 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats.");
  }
}
