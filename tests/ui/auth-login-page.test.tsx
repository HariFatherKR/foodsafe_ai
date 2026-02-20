import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

describe("/auth/login page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders placeholder login button and open-access notice", async () => {
    const { default: LoginPage } = await import("@/app/auth/login/page");
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: "Google 로그인 (준비중)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("현재 버전은 로그인 없이 모든 화면을 사용할 수 있습니다."),
    ).toBeInTheDocument();
  });
});
