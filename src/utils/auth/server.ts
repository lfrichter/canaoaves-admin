"use server";

import { createSupabaseServerClient } from "@utils/supabase/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";
import { type User } from "@supabase/supabase-js";

export async function verifyUserRole(allowedRoles: string[]): Promise<User> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required. User not found.");
  }

  // Use the service role client to fetch the profile, as RLS might prevent the user from reading their own profile.
  const serviceRoleSupabase = createSupabaseServiceRoleClient();
  const { data: profile, error: profileError } = await serviceRoleSupabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Permission denied. Profile not found.");
  }

  const userRole = profile.app_role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error(`Permission denied. User role '${userRole}' is not one of '${allowedRoles.join(", ")}'.`);
  }

  return user;
}
