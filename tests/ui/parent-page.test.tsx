import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ParentPage from "@/app/parent/page";

describe("/parent page", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders parent feed sections", () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/api/auth/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ profile: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url === "/api/parent/feed") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              notices: [],
              latestMenuPlan: null,
              syncedAt: null,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    render(<ParentPage />);

    expect(screen.getByRole("heading", { name: "학부모 알림" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "오늘 급식 안전 상태" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "최근 위험 공지" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "이번 주 메뉴 미리보기" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "알레르기 주의 정보" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "학부모 확인 플로우" })).toBeInTheDocument();
    expect(screen.queryByText("TodaySafetyBanner")).not.toBeInTheDocument();
    expect(screen.queryByText("RiskNoticeList")).not.toBeInTheDocument();
    expect(screen.queryByText("AllergyInfoCard")).not.toBeInTheDocument();
    expect(screen.queryByText("MenuPreviewCard")).not.toBeInTheDocument();
  });

  it("shows loading then renders feed data", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/api/auth/profile") {
        return Promise.resolve(
          new Response(JSON.stringify({ profile: { role: "user", email: "p@example.com" } }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url === "/api/parent/feed") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              notices: [
                {
                  id: "notice-1",
                  title: "Safety update",
                  body: "Milk risk found",
                  createdAt: "2026-02-16T09:00:00.000Z",
                },
              ],
              latestMenuPlan: {
                id: "menu-1",
                days: [{ day: "Monday", items: ["Rice", "Soup"] }],
              },
              syncedAt: "2026-02-16T09:00:00.000Z",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    render(<ParentPage />);

    expect(screen.getByText("피드를 불러오는 중입니다.")).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByText("주의가 필요한 공지가 있습니다. 상세 내용을 확인해 주세요."),
      ).toBeInTheDocument(),
    );

    expect(screen.queryByText("피드를 불러오는 중입니다.")).not.toBeInTheDocument();
    expect(screen.getByText(/Safety update/)).toBeInTheDocument();
    expect(
      screen.getAllByText((_, element) => element?.textContent === "월요일: Rice, Soup")
        .length,
    ).toBeGreaterThan(0);
  });
});
