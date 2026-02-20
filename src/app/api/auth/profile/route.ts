import { NextResponse } from "next/server";
import { ensureCurrentProfile } from "@/lib/auth/profile-server";

export async function GET() {
  try {
    const profile = await ensureCurrentProfile();
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}
