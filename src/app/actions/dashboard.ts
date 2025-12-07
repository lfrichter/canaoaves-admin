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

// export async function getDashboardStats(): Promise<DashboardStats> {
//   // [SEGURANÇA] Verifica se o usuário tem permissão antes de buscar dados
//   await verifyUserRole(["admin", "master"]);

//   const supabase = createSupabaseServiceRoleClient();

//   try {
//     const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

//     if (error) {
//       console.error("Error fetching admin dashboard RPC:", error);
//       throw error;
//     }

//     if (!data) {
//       console.warn("No data returned from get_admin_dashboard_stats RPC call.");
//       return getZeroedStats();
//     }

//     // O Supabase pode retornar um array se a função não for marcada como 'single',
//     // ou um objeto direto. Tratamos ambos os casos.
//     const rawStats = (Array.isArray(data) ? data[0] : data) as RpcStats;

//     // [MAPEAMENTO] Snake_case (Banco) -> CamelCase (Frontend)
//     return {
//       pendingClaims: Number(rawStats.pending_claims ?? 0),
//       pendingReports: Number(rawStats.pending_reports ?? 0),
//       pendingCityDescriptions: Number(rawStats.pending_city_descriptions ?? 0),
//       pendingCityImages: Number(rawStats.pending_city_images ?? 0),
//       pendingStateDescriptions: Number(rawStats.pending_state_descriptions ?? 0),

//       // Novos Totais
//       totalProfiles: Number(rawStats.total_profiles ?? 0),
//       totalServices: Number(rawStats.total_services ?? 0),
//       totalComments: Number(rawStats.total_comments ?? 0),
//       totalPhotos: Number(rawStats.total_photos ?? 0),
//     };

//   } catch (error) {
//     console.error("Error fetching dashboard stats:", error);
//     // Em caso de erro, retorna tudo zerado para a UI não quebrar
//     return getZeroedStats();
//   }
// }

// Helper para manter o código limpo


export async function getDashboardStats(): Promise<DashboardStats> {
  console.log(">>> INICIANDO getDashboardStats <<<");

  try {
    // 1. Teste de Permissão
    console.log("1. Verificando Role...");
    await verifyUserRole(["admin", "master"]);
    console.log("2. Role verificada com sucesso.");

    const supabase = createSupabaseServiceRoleClient();

    // 2. Chamada RPC
    console.log("3. Chamando RPC get_admin_dashboard_stats...");
    const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

    if (error) {
      console.error("❌ ERRO NA RPC DO SUPABASE:", error);
      throw error;
    }

    console.log("4. Dados brutos da RPC:", JSON.stringify(data, null, 2));

    if (!data) {
      console.warn("⚠️ RPC retornou dados vazios (null/undefined).");
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

    console.log("5. Stats processados:", finalStats);
    return finalStats;

  } catch (error: any) {
    // AQUI ESTÁ O PULO DO GATO: Se cair aqui, sabemos o porquê.
    console.error("🔥 ERRO FATAL EM getDashboardStats:", error.message);

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
