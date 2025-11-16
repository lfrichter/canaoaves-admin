"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

// O Type (camelCase) está correto e é o que a sua página page.tsx espera.
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
    // --- MUDANÇA PRINCIPAL ---
    // Trocamos as 5 chamadas de 'Promise.all' pela nossa nova função RPC.
    // Isso é muito mais rápido, pois faz tudo em uma única consulta no banco.
    const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

    if (error) {
      console.error("Error fetching admin dashboard RPC:", error);
      throw error;
    }

    // A função 'get_admin_dashboard_stats' retorna um JSON
    // com chaves em snake_case (padrão do Postgres).
    // Nós as mapeamos para o tipo camelCase que a página espera.
    return {
      pendingClaims: data.pending_claims ?? 0,
      pendingReports: data.pending_reports ?? 0,
      pendingCityDescriptions: data.pending_city_descriptions ?? 0,
      pendingCityImages: data.pending_city_images ?? 0,
      pendingStateDescriptions: data.pending_state_descriptions ?? 0,
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
