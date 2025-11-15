"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

export const authProviderClient: AuthProvider = {
    login: async ({ email, password }) => {
      const { data: signInData, error: signInError } =
        await supabaseBrowserClient.auth.signInWithPassword({
          email,
          password,
        });
  
      if (signInError) {
        return {
          success: false,
          error: signInError,
        };
      }
  
      if (signInData.user) {
        // Query the profiles table to get the app_role
        const { data: profileData, error: profileError } =
          await supabaseBrowserClient
            .from("profiles")
            .select("app_role")
            .eq("user_id", signInData.user.id)
            .single();
  
        // Handle case where profile is not found or there's an error fetching it
        if (profileError || !profileData) {
          await supabaseBrowserClient.auth.signOut();
          return {
            success: false,
            error: {
              name: "ProfileError",
              message:
                "Seu perfil não foi encontrado ou não está configurado corretamente. Por favor, contate o suporte.",
            },
          };
        }
  
        const userRole = profileData.app_role;
  
        if (userRole !== "admin" && userRole !== "master") {
          await supabaseBrowserClient.auth.signOut();
          return {
            success: false,
            error: {
              name: "AuthorizationError",
              message: "Você não tem permissão para acessar esta aplicação.",
            },
          };
        }
  
        return {
          success: true,
          redirectTo: "/",
        };
      }
  
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

    if (error || !data?.user) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    return {
      authenticated: true,
    };
  },
  getPermissions: async () => {
    const { data: userData } = await supabaseBrowserClient.auth.getUser();
    return userData?.user?.user_metadata?.app_role ?? null;
  },
  getIdentity: async () => {
    const { data, error } = await supabaseBrowserClient.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    const { user } = data;

    const { data: profile } = await supabaseBrowserClient
      .from("profiles")
      .select("app_role")
      .eq("user_id", user.id)
      .single();

    return {
      ...user,
      name: user.email,
      app_role: profile?.app_role,
    };
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
