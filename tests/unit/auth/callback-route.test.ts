import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession,
    },
  })),
}));

describe("/auth/callback route", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    exchangeCodeForSession.mockResolvedValue({ error: null });
  });

  it("exchanges code and redirects to safe next path", async () => {
    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      new Request(
        "https://foodsafe.example/auth/callback?code=oauth-code&next=%2Fparent%3Ftab%3D1",
      ),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://foodsafe.example/parent?tab=1",
    );
  });

  it("redirects to login when code is missing", async () => {
    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      new Request("https://foodsafe.example/auth/callback"),
    );

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://foodsafe.example/auth/login?error=oauth_callback_failed",
    );
  });

  it("redirects to login when exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("failed") });
    const { GET } = await import("@/app/auth/callback/route");

    const response = await GET(
      new Request("https://foodsafe.example/auth/callback?code=oauth-code"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://foodsafe.example/auth/login?error=oauth_callback_failed",
    );
  });
});
