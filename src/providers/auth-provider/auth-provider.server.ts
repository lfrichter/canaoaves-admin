import type { AuthProvider } from "@refinedev/core";
import { createSupabaseServerClient } from "@utils/supabase/server";

export const authProviderServer: AuthProvider = {
  login: async () => {
    return {
      success: false,
    };
  },
  register: async () => {
    return {
      success: false,
    };
  },
  forgotPassword: async () => {
    return {
      success: false,
    };
  },
  check: async () => {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    if (user) {
      return {
        authenticated: true,
        redirectTo: "/",
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    const { user } = data;

    if (error) {
      return null;
    }

    return user?.user_metadata.app_role ?? null;
  },
  getIdentity: async () => {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.getUser();
    const { user } = data;

    if (error) {
      return null;
    }

    return user;
  },
  onError: async (error) => {
    if (error.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }

    return {};
  },
  logout: async () => {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
};
