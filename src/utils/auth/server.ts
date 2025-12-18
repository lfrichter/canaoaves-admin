import { type User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@utils/supabase/server";
import { createSupabaseServiceRoleClient } from "@utils/supabase/serverClient";

export async function verifyUserRole(allowedRoles: string[]): Promise<User> {
  // [CORREÇÃO]: Voltamos a usar 'await' aqui, pois cookies() é assíncrono
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required. User not found.");
  }

  // ... (o restante do código permanece igual)
  const serviceRoleSupabase = createSupabaseServiceRoleClient();
  const { data: profile, error: profileError } = await serviceRoleSupabase
    .from("profiles")
    .select("app_role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Permission denied. Profile not found.");
  }

  const userRole = profile.app_role;

  if (allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    throw new Error(`Permission denied. User role '${userRole}' is not one of '${allowedRoles.join(", ")}'.`);
  }

  return user;
}
