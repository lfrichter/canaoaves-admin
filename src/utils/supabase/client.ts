import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: {
      schema: "public",
    },
    // Removido o customCookieStorage manual.
    // Usamos cookieOptions para lidar com o domínio e segurança.
    cookieOptions: {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN, // Define o domínio se existir
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // O @supabase/ssr lida automaticamente com chunking se o cookie for muito grande
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
);

export const supabaseBrowserClient = supabase;
