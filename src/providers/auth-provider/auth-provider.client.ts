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
        // 1. Espera a Server Action sincronizar a 'app_role'
        await updateAuthMetadata(signInData.user.id);

        // --- A CORREÇÃO ESTÁ AQUI ---
        // 2. Força o cliente a recarregar a sessão (e o cookie)
        //    que agora contém o novo 'user_metadata.app_role'.
        await supabaseBrowserClient.auth.refreshSession();
        // --- FIM DA CORREÇÃO ---

      } catch (error: any) {
        // Se a sincronização falhar, desloga o usuário
        await supabaseBrowserClient.auth.signOut();
        return {
          success: false,
          error: {
            name: "MetadataError",
            message: error.message || "Could not sync user role.",
          },
        };
      }

      // 3. Agora, redireciona para o dashboard.
      // O middleware irá ler o cookie atualizado e permitir o acesso.
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

  // ... (o resto do seu provider: logout, register, check, etc.)

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
          // Adicionamos o refresh aqui também por segurança
          await supabaseBrowserClient.auth.refreshSession();
        } catch (error: any) {
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
