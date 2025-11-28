"use server";

import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

// O Type (camelCase) está correto e é o que a sua página page.tsx espera.
type DashboardStats = {
  pendingClaims: number;
  pendingReports: number;
  pendingCityDescriptions: number;
  pendingCityImages: number;
  pendingStateDescriptions: number;
};

// Interface para o retorno da RPC (snake_case)
interface AdminDashboardStats {
  pending_claims: number;
  pending_reports: number;
  pending_city_descriptions: number;
  pending_city_images: number;
  pending_state_descriptions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await verifyUserRole(["admin", "master"]);
  const supabase = createSupabaseServiceRoleClient();

  try {
    const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

    if (error) {
      console.error("Error fetching admin dashboard RPC:", error);
      throw error;
    }

    if (!data) {
      console.warn("No data returned from get_admin_dashboard_stats RPC call.");
      return {
        pendingClaims: 0,
        pendingReports: 0,
        pendingCityDescriptions: 0,
        pendingCityImages: 0,
        pendingStateDescriptions: 0,
      };
    }

    // O tipo de retorno da RPC é 'Json', então precisamos fazer o cast para o formato esperado.
    const stats = data as unknown as {
      pending_claims: number;
      pending_reports: number;
      pending_city_descriptions: number;
      pending_city_images: number;
      pending_state_descriptions: number;
    };

    return {
      pendingClaims: stats.pending_claims ?? 0,
      pendingReports: stats.pending_reports ?? 0,
      pendingCityDescriptions: stats.pending_city_descriptions ?? 0,
      pendingCityImages: stats.pending_city_images ?? 0,
      pendingStateDescriptions: stats.pending_state_descriptions ?? 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Em caso de erro, retorna todos os zeros para não quebrar a UI
    return {
      pendingClaims: 0,
      pendingReports: 0,
      pendingCityDescriptions: 0,
      pendingCityImages: 0,
      pendingStateDescriptions: 0,
    };
  }
}
