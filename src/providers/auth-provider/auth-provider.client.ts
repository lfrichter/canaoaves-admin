"use client";

import { updateAuthMetadata } from "@/app/actions/auth";
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
        try {
          await updateAuthMetadata(signInData.user.id);
        } catch (error: any) {
          await supabaseBrowserClient.auth.signOut();
          return {
            success: false,
            error: {
              name: "MetadataError",
              message: error.message || "Could not sync user role.",
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

      if (data.user) {
        try {
          await updateAuthMetadata(data.user.id);
        } catch (error: any) {
          // If metadata sync fails, it's not critical for the registration itself.
          // The user can still log in, and the metadata will be synced then.
          // We can log this error for debugging purposes.
          console.error("Metadata sync failed during registration:", error);
        }
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

    return {
      ...user,
      name: user.email,
      app_role: user.user_metadata?.app_role,
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
