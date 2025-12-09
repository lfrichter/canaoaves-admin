"use server";

import { verifyUserRole } from "@utils/auth/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

// 1. Interface de Retorno para o Frontend (CamelCase)
// Essa é a interface que o seu componente page.tsx vai usar.
export interface DashboardStats {
  // Moderação
  pendingClaims: number;
  pendingReports: number;
  pendingCityDescriptions: number;
  pendingCityImages: number;
  pendingStateDescriptions: number;
  // Métricas Gerais (Novos campos)
  totalProfiles: number;
  totalServices: number;
  totalComments: number;
  totalPhotos: number;
}

// 2. Interface Interna do RPC (Snake_case)
// Representa exatamente o que vem do PostgreSQL/Supabase
interface RpcStats {
  pending_claims: number;
  pending_reports: number;
  pending_city_descriptions: number;
  pending_city_images: number;
  pending_state_descriptions: number;
  total_profiles: number;
  total_services: number;
  total_comments: number;
  total_photos: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {

  try {
    // 1. Teste de Permissão
    await verifyUserRole(["admin", "master"]);

    const supabase = createSupabaseServiceRoleClient();

    // 2. Chamada RPC
    const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

    if (error) {
      throw error;
    }


    if (!data) {
      return getZeroedStats();
    }

    const rawStats = (Array.isArray(data) ? data[0] : data) as any;

    const finalStats = {
      pendingClaims: Number(rawStats.pending_claims ?? 0),
      pendingReports: Number(rawStats.pending_reports ?? 0),
      pendingCityDescriptions: Number(rawStats.pending_city_descriptions ?? 0),
      pendingCityImages: Number(rawStats.pending_city_images ?? 0),
      pendingStateDescriptions: Number(rawStats.pending_state_descriptions ?? 0),
      totalProfiles: Number(rawStats.total_profiles ?? 0),
      totalServices: Number(rawStats.total_services ?? 0),
      totalComments: Number(rawStats.total_comments ?? 0),
      totalPhotos: Number(rawStats.total_photos ?? 0),
    };

    return finalStats;

  } catch (error: any) {
    console.error("🔥 Erro em getDashboardStats:", error.message);
    // Se o erro for de redirecionamento (Auth), o Next.js trata diferente,
    // mas se for erro de lógica, veremos aqui no terminal.
    return getZeroedStats();
  }
}

function getZeroedStats(): DashboardStats {
  return {
    pendingClaims: 0,
    pendingReports: 0,
    pendingCityDescriptions: 0,
    pendingCityImages: 0,
    pendingStateDescriptions: 0,
    totalProfiles: 0,
    totalServices: 0,
    totalComments: 0,
    totalPhotos: 0,
  };
}
