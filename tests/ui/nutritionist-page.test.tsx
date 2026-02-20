import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import NutritionistPage from "@/app/nutritionist/page";

describe("/nutritionist page", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders core dashboard panels", () => {
    render(<NutritionistPage />);

    expect(screen.getByRole("heading", { name: "영양사 운영실" })).toBeInTheDocument();
    expect(screen.getByText("위해")).toBeInTheDocument();
    expect(screen.getByText("메뉴")).toBeInTheDocument();
    expect(screen.getByText("공지")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "식자재 등록", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "위해도 점검", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "메뉴 조건 설정", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "주간 메뉴 보기", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "해커톤 발표 플로우", level: 2 })).toBeInTheDocument();
    expect(screen.queryByText("Menu View")).not.toBeInTheDocument();
    expect(screen.queryByText("IngredientInputPanel")).not.toBeInTheDocument();
    expect(screen.queryByText("RiskCheckPanel")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "학부모 공지 발행" }),
    ).toBeInTheDocument();
    expect(screen.getByText("데이터 출처: 식약처 공개데이터")).toBeInTheDocument();
    expect(screen.getByText("식자재명")).toBeInTheDocument();
    expect(screen.getByText("급식 인원")).toBeInTheDocument();
    expect(screen.getByText("총 예산")).toBeInTheDocument();
  });

  it("enables publish button after menu is generated", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/api/mfds/datasets") {
        return Promise.resolve(
          new Response(JSON.stringify({ datasets: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url === "/api/menu/generate") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              menuPlan: {
                id: "menu-1",
                days: [
                  {
                    day: "Monday",
                    items: ["Rice", "Soup"],
                    allergyWarnings: [],
                  },
                ],
              },
              fallbackUsed: false,
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

    render(<NutritionistPage />);

    const publishButton = screen.getByRole("button", { name: "학부모 공지 발행" });
    expect(publishButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "메뉴 생성" }));

    await waitFor(() => expect(publishButton).toBeEnabled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/menu/generate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows loading state while menu generation is in progress", async () => {
    const user = userEvent.setup();

    let resolveMenuRequest:
      | ((value: Response | PromiseLike<Response>) => void)
      | undefined;

    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();

      if (url === "/api/mfds/datasets") {
        return Promise.resolve(
          new Response(JSON.stringify({ datasets: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }

      if (url === "/api/menu/generate") {
        return new Promise<Response>((resolve) => {
          resolveMenuRequest = resolve;
        });
      }

      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    render(<NutritionistPage />);

    await user.click(screen.getByRole("button", { name: "메뉴 생성" }));

    expect(screen.getByRole("button", { name: "메뉴 생성 중..." })).toBeDisabled();

    if (!resolveMenuRequest) {
      throw new Error("menu request resolver was not captured");
    }

    resolveMenuRequest(
      new Response(
        JSON.stringify({
          menuPlan: {
            id: "menu-loading-test",
            days: [
              {
                day: "Monday",
                items: ["Rice", "Soup"],
                allergyWarnings: [],
              },
            ],
          },
          fallbackUsed: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "메뉴 생성" })).toBeInTheDocument(),
    );
  });
});
