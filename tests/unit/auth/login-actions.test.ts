import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const createServerSupabaseClientMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

describe("signInWithGoogleAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    createServerSupabaseClientMock.mockReset();
  });

  it("redirects with oauth_config_missing when Supabase env is missing", async () => {
    createServerSupabaseClientMock.mockRejectedValue(
      new Error("Missing Supabase env"),
    );

    const { signInWithGoogleAction } = await import("@/app/auth/login/actions");
    const formData = new FormData();
    formData.set("next", "/parent");

    await expect(signInWithGoogleAction(formData)).rejects.toThrow(
      "REDIRECT:/auth/login?error=oauth_config_missing&next=%2Fparent",
    );
    expect(redirectMock).toHaveBeenCalledWith(
      "/auth/login?error=oauth_config_missing&next=%2Fparent",
    );
  });
});
