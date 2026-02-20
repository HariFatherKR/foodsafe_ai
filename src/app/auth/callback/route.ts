import { NextResponse } from "next/server";
import { normalizeNextPath } from "@/lib/auth/guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CALLBACK_FAILED_PATH = "/auth/login?error=oauth_callback_failed";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(CALLBACK_FAILED_PATH, requestUrl));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(CALLBACK_FAILED_PATH, requestUrl));
    }

    return NextResponse.redirect(new URL(next, requestUrl));
  } catch {
    return NextResponse.redirect(new URL(CALLBACK_FAILED_PATH, requestUrl));
  }
}
