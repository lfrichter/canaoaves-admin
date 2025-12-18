import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

export const createSupabaseServerClient = async () => {
  // O cookieStore deve ser aguardado em versões modernas do Next.js
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        // Apenas repasse a lista de cookies.
        // A biblioteca @supabase/ssr fará a remontagem dos chunks automaticamente.
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O método setAll foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver middleware atualizando a sessão.
          }
        },
      },
    }
  );
};
