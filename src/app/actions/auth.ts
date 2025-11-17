"use server";

import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function updateAuthMetadata(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const supabase = createSupabaseServiceRoleClient();

  // 1. Fetch the user's app_role from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(`Could not find profile for user ID: ${userId}`);
  }

  const appRole = profile.app_role;

  // 2. Update the user's user_metadata in auth.users
  const { data: updatedUser, error: updateUserError } =
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { app_role: appRole },
    });

  if (updateUserError) {
    throw new Error(updateUserError.message);
  }

  return updatedUser;
}
