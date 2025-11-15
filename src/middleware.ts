import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "./utils/supabase/constants";

const protectedRoutes: string[] = [
  "/",
  "/amenities",
  "/categories",
  "/city-descriptions",
  "/city-images",
  "/profiles",
  "/reports",
  "/service-offerings",
  "/service-ownership-claims",
  "/services",
  "/state-descriptions",
  "/static-content",
];

const adminRoutes: string[] = ["/"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole = null;
  if (user) {
    // Fetch the role from the profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("app_role")
      .eq("user_id", user.id)
      .single();
    userRole = profile?.app_role;
  }

  const { pathname } = request.nextUrl;

  if (!user && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (userRole !== "admin" && userRole !== "master") {
      await supabase.auth.signOut();
      const redirectUrl = new URL("/login", request.url);
      const responseRedirect = NextResponse.redirect(redirectUrl, {
        headers: response.headers,
      });

      return responseRedirect;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/amenities/:path*",
    "/categories/:path*",
    "/city-descriptions/:path*",
    "/city-images/:path*",
    "/profiles/:path*",
    "/reports/:path*",
    "/service-offerings/:path*",
    "/service-ownership-claims/:path*",
    "/services/:path*",
    "/state-descriptions/:path*",
    "/static-content/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
