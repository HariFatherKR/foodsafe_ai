import { NextRequest, NextResponse } from "next/server";
import { buildLoginRedirect, isAdminPath, isPublicPath } from "@/lib/auth/guard";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

function toLoginRedirect(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const loginPath = buildLoginRedirect(pathname, search);
  return NextResponse.redirect(new URL(loginPath, request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    const { supabase, response } = createMiddlewareSupabaseClient(request);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return toLoginRedirect(request);
    }

    if (isAdminPath(pathname)) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return response;
  } catch {
    return toLoginRedirect(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
