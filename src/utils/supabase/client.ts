import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./constants";

const cookieOptions = {
  domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

export const supabaseBrowserClient = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: {
      schema: "public",
    },
    cookieOptions,
  }
);
