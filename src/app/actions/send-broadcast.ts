"use server";

import { getBroadcastHtml } from "@/templates/broadcast-email";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function sendBroadcastAction(
  subject: string,
  message: string,
  adminUserId: string,
  targetEmails?: string[]
) {
  try {
    // 2. Environment Variables Check
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");
      return { success: false, message: "Erro de configuração: RESEND_API_KEY não encontrada." };
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials are missing");
      return { success: false, message: "Erro de configuração: Credenciais do Supabase não encontradas." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabaseAdmin
      .from("profile_users")
      .select("email, full_name")
      .not("email", "is", null)
      .is("banned_until", null)
      .is("user_deleted_at", null);

    if (targetEmails && targetEmails.length > 0) {
      query = query.in("email", targetEmails);
    }

    const { data: profiles, error } = await query;

    if (error) throw new Error("Erro na query: " + error.message);
    if (!profiles || profiles.length === 0) return { success: false, message: "Nenhum usuário encontrado." };

    const validRecipients = profiles
      .filter(p => p.email && p.email.includes("@"))
      .map(p => ({ email: p.email, name: p.full_name }));

    const total = validRecipients.length;

    // Batching
    const BATCH_SIZE = 50;
    const chunks = [];
    for (let i = 0; i < total; i += BATCH_SIZE) {
      chunks.push(validRecipients.slice(i, i + BATCH_SIZE));
    }

    let sentCount = 0;

    for (const chunk of chunks) {
      const emailBatch = chunk.map((recipient) => ({
        from: "Canaoaves <nao-responda@canaoaves.com.br>",
        to: [recipient.email],
        subject: subject,
        // [NOVO] Chamada limpa do template
        html: getBroadcastHtml({
          subject: subject,
          message: message,
          recipientName: recipient.name || 'Observador'
        }),
      }));

      const { error: batchError } = await resend.batch.send(emailBatch);
      if (batchError) console.error("Erro no lote:", batchError);
      else sentCount += chunk.length;
    }

    // Histórico
    await supabaseAdmin.from("communications").insert({
      subject,
      message_body: message,
      recipient_count: sentCount,
      sent_by_user_id: adminUserId,
      filter_criteria: targetEmails ? { type: "specific_users", count: targetEmails.length } : { type: "all_active_users" }
    });

    return { success: true, count: sentCount };

  } catch (err: any) {
    console.error("Erro crítico no envio de broadcast:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao enviar o broadcast."
    };
  }
}
