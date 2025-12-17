"use server";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// CUIDADO: Esta chave deve estar no .env.local e NUNCA ter NEXT_PUBLIC
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function impersonateUser(targetEmail: string) {

  // 2. Cliente ADMIN (Service Role) para gerar o link
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Use a URL completa com /auth/callback para garantir que a aplicação
  // principal processe o hash corretamente.
  const redirectUrl = "https://www.canaoaves.com.br/auth/callback";

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink", // Volte para magiclink
    email: targetEmail,
    options: {
        redirectTo: redirectUrl
    }
  });

  if (error) throw new Error("Erro: " + error.message);

  // Log visual para garantir
  console.log("----------------------------------------");
  console.log(`🔗 MAGIC LINK (${targetEmail}):`);
  console.log(data.properties?.action_link);
  console.log("----------------------------------------");

  return data.properties?.action_link;
}
