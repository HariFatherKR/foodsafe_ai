"use server";

import { redirect } from "next/navigation";
import { normalizeNextPath } from "@/lib/auth/guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSiteUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicitUrl && explicitUrl.trim().length > 0) {
    return explicitUrl;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim().length > 0) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export async function signInWithGoogleAction(formData: FormData) {
  const nextValue = formData.get("next");
  const next = normalizeNextPath(
    typeof nextValue === "string" ? nextValue : "/",
  );

  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  callbackUrl.searchParams.set("next", next);

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    redirect(`/auth/login?error=oauth_start_failed&next=${encodeURIComponent(next)}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
