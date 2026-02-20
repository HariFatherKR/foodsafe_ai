import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

describe("/ home page", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders domain-fit hero contracts", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          datasets: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<Home />);

    expect(screen.getByText("SCHOOL MEAL SAFETY")).toBeInTheDocument();
    expect(screen.getByText("CORE SERVICES")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ENTER NUTRITION CENTER" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "OPEN PARENT FEED" })).toBeInTheDocument();
  });

  it("renders brutal dataset cards after loading", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          datasets: [
            {
              srvcSn: 1,
              serviceName: "식품 회수 정보",
              category: "식품안전",
              provider: "식약처",
              openedAt: "2026-01-01",
              usageLink: "https://example.com/source",
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("식품 회수 정보")).toBeInTheDocument();
    });

    expect(screen.getByText("MFDS DATA HUB")).toBeInTheDocument();
  });
});
