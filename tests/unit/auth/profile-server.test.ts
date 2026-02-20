import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerSupabaseClientMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

function mockUnauthenticatedClient() {
  createServerSupabaseClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  });
}

describe("profile-server", () => {
  beforeEach(() => {
    createServerSupabaseClientMock.mockReset();
  });

  it("getCurrentProfile returns null when unauthenticated", async () => {
    mockUnauthenticatedClient();
    const { getCurrentProfile } = await import("@/lib/auth/profile-server");

    await expect(getCurrentProfile()).resolves.toBeNull();
  });

  it("ensureCurrentProfile inserts default user profile when missing", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: "PGRST116", message: "no rows" } });

    const single = vi.fn().mockResolvedValue({
      data: {
        id: "user-1",
        email: "user@example.com",
        role: "user",
        updated_at: "2026-02-20T00:00:00.000Z",
      },
      error: null,
    });

    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single,
      }),
    });

    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle,
        }),
      }),
      insert,
    });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "user@example.com",
            },
          },
          error: null,
        }),
      },
      from,
      rpc: vi.fn(),
    });

    const { ensureCurrentProfile } = await import("@/lib/auth/profile-server");
    const profile = await ensureCurrentProfile();

    expect(profile?.id).toBe("user-1");
    expect(profile?.role).toBe("user");
    expect(insert).toHaveBeenCalled();
  });

  it("setUserRoleAsAdmin calls rpc and returns updated profile", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        id: "user-2",
        email: "target@example.com",
        role: "admin",
        updated_at: "2026-02-20T00:00:00.000Z",
      },
      error: null,
    });

    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: "user-1",
              email: "admin@example.com",
              role: "admin",
              updated_at: "2026-02-20T00:00:00.000Z",
            },
            error: null,
          }),
        }),
      }),
      insert: vi.fn(),
    });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "admin@example.com",
            },
          },
          error: null,
        }),
      },
      from,
      rpc,
    });

    const { setUserRoleAsAdmin } = await import("@/lib/auth/profile-server");
    const updated = await setUserRoleAsAdmin("user-2", "admin");

    expect(rpc).toHaveBeenCalledWith("admin_set_user_role", {
      target_user_id: "user-2",
      next_role: "admin",
    });
    expect(updated.id).toBe("user-2");
    expect(updated.role).toBe("admin");
  });

  it("maps self demotion rpc error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "P0001",
        message: "self demotion is not allowed",
      },
    });

    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: "user-1",
              email: "admin@example.com",
              role: "admin",
              updated_at: "2026-02-20T00:00:00.000Z",
            },
            error: null,
          }),
        }),
      }),
      insert: vi.fn(),
    });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-1",
              email: "admin@example.com",
            },
          },
          error: null,
        }),
      },
      from,
      rpc,
    });

    const { setUserRoleAsAdmin, RoleUpdateError } = await import(
      "@/lib/auth/profile-server"
    );

    await expect(setUserRoleAsAdmin("user-1", "user")).rejects.toMatchObject({
      name: RoleUpdateError.name,
      code: "self_demotion_blocked",
    });
  });
});
