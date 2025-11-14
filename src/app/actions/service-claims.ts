"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

const supabase = createSupabaseServiceRoleClient();

export async function handleClaimApproval(claimId: string, approved: boolean) {
  const { data, error } = await supabase.rpc("handle_claim_approval", {
    claim_id: claimId,
    approved: approved,
  });

  if (error) {
    throw error;
  }

  return data;
}
