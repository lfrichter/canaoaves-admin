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
    try {
      await supabaseBrowserClient.auth.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
      // Mesmo se o signOut falhar, redirecionamos para o login
      // para quebrar qualquer loop de autenticação.
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
    try {
      const { data, error } = await supabaseBrowserClient.auth.getUser();

      // Se tiver erro ou não tiver usuário, chuta para o login
      if (error || !data?.user) {
        return {
          authenticated: false,
          redirectTo: "/login",
          logout: true, // Força o Refine a limpar o estado dele
        };
      }

      return {
        authenticated: true,
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }
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

    // Fetch profile data to get public_name and avatar_url
    const { data: profileData, error: profileError } = await supabaseBrowserClient
      .from("profiles")
      .select("public_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle(); // Use maybeSingle() to handle cases where no profile is found

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching profile for identity:", profileError);
        // Optionally, handle error more gracefully, but for now, proceed with partial identity
    }

    return {
      ...user, // Keep all existing user properties from Supabase Auth
      id: user.id, // Ensure id is explicitly set
      name: user.email, // Fallback name from auth
      email: user.email,
      app_role: user.user_metadata?.app_role,
      public_name: profileData?.public_name || user.email, // Use public_name from profile or email as fallback
      avatar: profileData?.avatar_url || undefined, // Use avatar_url from profile
    };
  },
  onError: async (error) => {
    console.error("Auth Error Detectado:", error);

    const status = error?.status || error?.statusCode || error?.code;

    // Adicionado status 400 (Bad Request) e 403 (Forbidden)
    // O erro 400 acontece quando o refresh token está corrompido/inválido
    if (status === 400 || status === 401 || status === 403 || status === "PGRST301") {

      // Força a limpeza do Supabase no navegador
      await supabaseBrowserClient.auth.signOut();

      return {
        logout: true,
        redirectTo: "/login",
        error: {
            message: "Sessão expirada. Faça login novamente.",
            name: "Session Error"
        }
      };
    }

    return { error };
  },
};
