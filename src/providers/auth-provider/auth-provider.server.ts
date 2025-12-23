import type { AuthProvider } from "@refinedev/core";
import { createClient } from "@utils/supabase/server";
import { cookies } from "next/headers";

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
    const cookieStore = cookies();

    try {
      // Cria o cliente supabase server-side
      const client = await createClient();

      // Tenta pegar o usuário. O getUser é mais seguro que getSession no server
      const { data, error } = await client.auth.getUser();

      // Se der erro no Supabase ou não tiver usuário, chuta para login
      if (error || !data?.user) {
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
        };
      }

      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (error) {
      // 🛡️ BLINDAGEM: Se o createClient ou getUser explodir, redireciona
      // Isso evita o erro 500 na tela
      console.error("Check Auth Server Error:", error);
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => {
    try {
      const client = await createClient();
      const { data } = await client.auth.getUser();
      return data?.user?.user_metadata?.app_role ?? null;
    } catch (error) {
      return null;
    }
  },
  getIdentity: async () => {
    try {
      const client = await createClient();
      const { data, error } = await client.auth.getUser();

      if (error || !data?.user) {
        return null;
      }

      // Adicionei um tratamento básico caso precise buscar dados extras
      // Se não precisar de tabela profiles no server, pode retornar só o user
      return data.user;

    } catch (error) {
      console.error("GetIdentity Server Error:", error);
      return null;
    }
  },
  onError: async (error) => {
    console.error("OnError Server:", error);
    // Captura erros de resposta HTTP no server
    if (error?.status === 401 || error?.status === 403 || error?.code === "PGRST301") {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },
  logout: async () => {
    try {
      const client = await createClient();
      await client.auth.signOut();
      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
       return {
        success: true,
        redirectTo: "/login",
      };
    }
  },
};
