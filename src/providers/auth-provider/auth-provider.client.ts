"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data?.session) {
      await supabaseBrowserClient.auth.setSession(data.session);

      return {
        success: true,
        redirectTo: "/",
      };
    }

    // for third-party login
    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseBrowserClient.auth.signOut();

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
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  check: async () => {
    const { data, error } = await supabaseBrowserClient.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    if (user) {
      const userRole = user.user_metadata?.app_role;

      if (userRole !== "admin" && userRole !== "master") {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true,
        };
      }

      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const { data: userData } = await supabaseBrowserClient.auth.getUser();
    return userData?.user?.user_metadata?.app_role ?? null;
  },
  getIdentity: async () => {
    const { data: userData } = await supabaseBrowserClient.auth.getUser();

    if (userData?.user) {
      return {
        ...userData.user,
        name: userData.user.email,
        app_role: userData.user.user_metadata?.app_role,
      };
    }

    return null;
  },
  onError: async (error) => {
    if (error?.code === "PGRST301" || error?.code === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
};
