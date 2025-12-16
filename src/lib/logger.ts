// src/lib/logger.ts
import { supabase } from "@utils/supabase/client";

interface ErrorLogParams {
  message: string;
  code?: string;
  details?: any;
  email?: string;
}

export const logClientError = async ({ message, code, details, email }: ErrorLogParams) => {
  if (process.env.NODE_ENV === 'development') {
    console.error("[Logger]", message, details);
  }

  try {
    await supabase.from('client_errors').insert({
      error_message: message,
      error_code: code,
      error_details: details ? JSON.stringify(details) : null,
      user_email: email,
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    });
  } catch (e) {
    console.error("Falha crítica ao salvar log de erro:", e);
  }
};
