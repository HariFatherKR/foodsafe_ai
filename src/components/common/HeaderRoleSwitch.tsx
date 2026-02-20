"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/auth/login/actions";

type HeaderProfile = {
  email: string;
  role: "admin" | "user";
};

export function HeaderRoleSwitch() {
  const [profile, setProfile] = useState<HeaderProfile | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { profile?: HeaderProfile | null };
        if (alive && data.profile) {
          setProfile(data.profile);
        }
      } catch {
        // Ignore header profile fetch errors.
      }
    }

    void loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <nav className="role-switch">
      <Link className="role-switch__brand" href="/">
        FoodSafeAI Command Center
      </Link>
      <div className="role-switch__links">
        <Link className="role-switch__link" href="/nutritionist">
          영양사 화면
        </Link>
        <Link className="role-switch__link" href="/parent">
          학부모 화면
        </Link>
        {profile?.role === "admin" ? (
          <Link className="role-switch__link" href="/admin">
            관리자
          </Link>
        ) : null}
        {profile ? <span className="pill-chip">내 등급: {profile.role}</span> : null}
        <form action={signOutAction}>
          <button className="role-switch__link" type="submit">
            로그아웃
          </button>
        </form>
      </div>
    </nav>
  );
}
