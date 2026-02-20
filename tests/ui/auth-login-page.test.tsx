import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import LoginPage from "@/app/auth/login/page";

describe("/auth/login page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders google sign-in button", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("button", { name: "Google로 로그인" }),
    ).toBeInTheDocument();
  });

  it("shows callback failure message", async () => {
    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: "oauth_callback_failed" }),
      }),
    );

    expect(
      screen.getByText("로그인 처리에 실패했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
