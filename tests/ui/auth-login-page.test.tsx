import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileMock = vi.fn();

vi.mock("@/lib/auth/profile-server", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

describe("/auth/login page", () => {
  beforeEach(() => {
    getCurrentProfileMock.mockReset();
    getCurrentProfileMock.mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders google sign-in button", async () => {
    const { default: LoginPage } = await import("@/app/auth/login/page");
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("button", { name: "Google로 로그인" }),
    ).toBeInTheDocument();
  });

  it("shows callback failure message", async () => {
    const { default: LoginPage } = await import("@/app/auth/login/page");
    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: "oauth_callback_failed" }),
      }),
    );

    expect(
      screen.getByText("로그인 처리에 실패했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("shows configuration missing message", async () => {
    const { default: LoginPage } = await import("@/app/auth/login/page");
    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: "oauth_config_missing" }),
      }),
    );

    expect(
      screen.getByText("OAuth 설정이 누락되어 로그인할 수 없습니다. 관리자에게 문의해 주세요."),
    ).toBeInTheDocument();
  });

  it("shows current account role when profile exists", async () => {
    getCurrentProfileMock.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      role: "admin",
      updatedAt: "2026-02-20T00:00:00.000Z",
    });

    const { default: LoginPage } = await import("@/app/auth/login/page");
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("현재 계정: admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("현재 등급: admin")).toBeInTheDocument();
  });
});
