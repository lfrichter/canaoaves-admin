"use server";

import { createClient } from "@supabase/supabase-js";

// Usamos o client ADMIN para poder ler a tabela auth.users através da view
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getRecipientsAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profile_users")
      .select("id, full_name, email")
      .not("email", "is", null)       // Tem e-mail
      .is("banned_until", null)       // Não está banido
      .is("user_deleted_at", null)    // Não foi deletado
      .order("full_name");

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error: any) {
    console.error("Erro ao buscar destinatários:", error);
    return { success: false, error: error.message };
  }
}
