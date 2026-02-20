"use client";

import Link from "next/link";

export function HeaderRoleSwitch() {
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
        <Link className="role-switch__link" href="/admin">
          관리자
        </Link>
        <Link className="role-switch__link" href="/auth/login">
          로그인
        </Link>
      </div>
    </nav>
  );
}
