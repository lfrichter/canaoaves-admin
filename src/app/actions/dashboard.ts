"use server";

import { createSupabaseServiceRoleClient } from "@/utils/supabase/serverClient";

/**
 * Fetches all statistics for the main dashboard page.
 * This function performs multiple parallel queries to get an overview of the platform.
 */
export async function getDashboardStats() {
  const supabase = createSupabaseServiceRoleClient();

  try {
    // Parallelize all count queries for efficiency
    const [
      reportsRes,
      claimsRes,
      cityDescRes,
      cityImgRes,
      stateDescRes,
      profilesRes,
      servicesRes,
      commentsRes,
      photosRes,
    ] = await Promise.all([
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("service_ownership_claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("city_descriptions").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("city_images").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("state_descriptions").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("services").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("photos").select("id", { count: "exact", head: true }),
    ]);

    // Error handling can be improved here if needed, but for now we'll log and return 0
    if(reportsRes.error) console.error("Dashboard Stats Error (Reports):", reportsRes.error.message);
    if(claimsRes.error) console.error("Dashboard Stats Error (Claims):", claimsRes.error.message);
    // ... add error logging for other queries if necessary

    return {
      pendingReports: reportsRes.count ?? 0,
      pendingClaims: claimsRes.count ?? 0,
      pendingCityDescriptions: cityDescRes.count ?? 0,
      pendingCityImages: cityImgRes.count ?? 0,
      pendingStateDescriptions: stateDescRes.count ?? 0,
      totalProfiles: profilesRes.count ?? 0,
      totalServices: servicesRes.count ?? 0,
      totalComments: commentsRes.count ?? 0,
      totalPhotos: photosRes.count ?? 0,
    };

  } catch (error) {
    console.error("A major error occurred in getDashboardStats:", error);
    // Return a default state in case of a critical failure
    return {
      pendingReports: 0,
      pendingClaims: 0,
      pendingCityDescriptions: 0,
      pendingCityImages: 0,
      pendingStateDescriptions: 0,
      totalProfiles: 0,
      totalServices: 0,
      totalComments: 0,
      totalPhotos: 0,
    };
  }
}

/**
 * Fetches only the counts of pending items for the header dropdown.
 * This is a lightweight version of getDashboardStats for a specific UI component.
 */
export async function getPendingCounts() {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const [reportsRes, claimsRes, cityDescRes, cityImgRes, stateDescRes] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("service_ownership_claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("city_descriptions").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("city_images").select("id", { count: "exact", head: true }).eq("approved", false),
        supabase.from("state_descriptions").select("id", { count: "exact", head: true }).eq("approved", false),
    ]);

    if (reportsRes.error) console.error("Pending Counts Error (Reports):", reportsRes.error.message);
    if (claimsRes.error) console.error("Pending Counts Error (Claims):", claimsRes.error.message);
    if (cityDescRes.error) console.error("Pending Counts Error (City Desc):", cityDescRes.error.message);
    if (cityImgRes.error) console.error("Pending Counts Error (City Img):", cityImgRes.error.message);
    if (stateDescRes.error) console.error("Pending Counts Error (State Desc):", stateDescRes.error.message);

    return {
      reports: reportsRes.count ?? 0,
      claims: claimsRes.count ?? 0,
      cityDescriptions: cityDescRes.count ?? 0,
      cityImages: cityImgRes.count ?? 0,
      stateDescriptions: stateDescRes.count ?? 0,
    };
  } catch (error) {
    console.error("A major error occurred in getPendingCounts:", error);
    return { reports: 0, claims: 0, cityDescriptions: 0, cityImages: 0, stateDescriptions: 0 };
  }
}
