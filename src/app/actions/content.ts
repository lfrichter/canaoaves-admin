"use server";

import { verifyUserRole } from "@utils/auth/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { validateContentResource } from "@utils/validation/server";
import { TableName } from "../../types/app";

export async function handleContentApproval(
  resource: TableName,
  id: string,
  approved: boolean
) {
  await verifyUserRole(["admin", "master"]);
  validateContentResource(resource);
  if (typeof id !== "string") {
    throw new Error("Invalid ID provided.");
  }
  if (typeof approved !== "boolean") {
    throw new Error("Invalid 'approved' value provided.");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(resource)
    .update({ approved: approved })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  revalidatePath("/");
  return data;
}

export async function deleteContent(resource: TableName, id: string) {
  await verifyUserRole(["admin", "master"]);
  validateContentResource(resource);
  if (typeof id !== "string") {
    throw new Error("Invalid ID provided.");
  }
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from(resource).delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
  return {
    data: { id },
  };
}
