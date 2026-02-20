import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileMock = vi.fn();
const listProfilesForAdminMock = vi.fn();
const listRoleChangeLogsForAdminMock = vi.fn();

vi.mock("@/lib/auth/profile-server", () => ({
  getCurrentProfile: getCurrentProfileMock,
  listProfilesForAdmin: listProfilesForAdminMock,
  listRoleChangeLogsForAdmin: listRoleChangeLogsForAdminMock,
}));

describe("/admin page", () => {
  beforeEach(() => {
    getCurrentProfileMock.mockReset();
    listProfilesForAdminMock.mockReset();
    listRoleChangeLogsForAdminMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders admin sections with users and logs", async () => {
    getCurrentProfileMock.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      role: "admin",
      updatedAt: "2026-02-20T00:00:00.000Z",
    });

    listProfilesForAdminMock.mockResolvedValue([
      {
        id: "user-1",
        email: "admin@example.com",
        role: "admin",
        updatedAt: "2026-02-20T00:00:00.000Z",
      },
      {
        id: "user-2",
        email: "user@example.com",
        role: "user",
        updatedAt: "2026-02-20T00:00:00.000Z",
      },
    ]);

    listRoleChangeLogsForAdminMock.mockResolvedValue([
      {
        id: "log-1",
        targetUserId: "user-2",
        oldRole: "user",
        newRole: "admin",
        changedBy: "user-1",
        targetEmail: "user@example.com",
        changedByEmail: "admin@example.com",
        createdAt: "2026-02-20T01:00:00.000Z",
      },
    ]);

    const { default: AdminPage } = await import("@/app/admin/page");
    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "관리자 권한 관리" })).toBeInTheDocument();
    expect(screen.getAllByText("admin@example.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("user@example.com").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "admin@example.com-to-user" }),
    ).toBeDisabled();
  });
});
