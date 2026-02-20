import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DocsPage from "@/app/docs/page";

describe("/docs page", () => {
  it("renders CI and Ralph Loop documentation sections", () => {
    render(<DocsPage />);

    expect(
      screen.getByRole("heading", { name: "Ralph Loop · CI 운영 문서" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "필수 GitHub Checks", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ralph Loop 실행 순서", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Vercel + Supabase 게이트", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "빠른 시작 3단계", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "운영 체크리스트", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "PR 템플릿 보기" }),
    ).toBeInTheDocument();
  });
});
