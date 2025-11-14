"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

const supabase = createSupabaseServiceRoleClient();

export async function handleContentApproval(
  resource: string,
  id: string,
  approved: boolean
) {
  const { data, error } = await supabase
    .from(resource)
    .update({ approved: approved })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteContent(resource: string, id: string) {
  const { error } = await supabase.from(resource).delete().eq("id", id);

  if (error) {
    throw error;
  }

  return {
    data: { id },
  };
}
