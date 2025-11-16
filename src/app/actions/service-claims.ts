"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

// Não precisamos de uma instância 'supabase' global,
// é melhor criá-la dentro da função para garantir o contexto.

export async function handleClaimApproval(claimId: string, approved: boolean) {
  const supabase = createSupabaseServiceRoleClient();

  // --- MUDANÇA PRINCIPAL ---
  // Trocamos a chamada RPC por uma atualização (UPDATE) na tabela.

  // 1. Determina o novo status
  const newStatus = approved ? "approved" : "rejected";

  // 2. Atualiza a linha na tabela 'service_ownership_claims'
  const { data, error } = await supabase
    .from("service_ownership_claims")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(), // Opcional: marca a data da revisão
    })
    .eq("id", claimId) // Para o ID da reivindicação correta
    .select() // Retorna o registro atualizado
    .single(); // Esperamos apenas um

  // O gatilho 'on_claim_status_change' no seu banco de dados
  // será disparado AUTOMATICAMENTE por esta atualização
  // e executará a lógica de 'handle_claim_approval'.

  if (error) {
    throw error;
  }

  return data;
}
