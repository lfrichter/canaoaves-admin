import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/database.types";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./constants";

export const createSupabaseServiceRoleClient = () => {
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false, // Service role key doesn't need session persistence
    },
  });
};
