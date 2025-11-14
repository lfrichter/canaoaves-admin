"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

type DashboardStats = {
  pendingClaims: number;
  pendingReports: number;
  pendingCityDescriptions: number;
  pendingCityImages: number;
  pendingStateDescriptions: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const [
      claimsResult,
      reportsResult,
      cityDescriptionsResult,
      cityImagesResult,
      stateDescriptionsResult,
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
      pendingClaims: claimsResult.count ?? 0,
      pendingReports: reportsResult.count ?? 0,
      pendingCityDescriptions: cityDescriptionsResult.count ?? 0,
      pendingCityImages: cityImagesResult.count ?? 0,
      pendingStateDescriptions: stateDescriptionsResult.count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // In case of a general error, return all zeros to avoid breaking the UI
    return {
      pendingClaims: 0,
      pendingReports: 0,
      pendingCityDescriptions: 0,
      pendingCityImages: 0,
      pendingStateDescriptions: 0,
    };
  }
}