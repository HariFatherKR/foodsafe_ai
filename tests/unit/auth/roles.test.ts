import { describe, expect, it } from "vitest";
import { canAccessAdminPage, isSelfDemotionBlocked } from "@/lib/auth/roles";

describe("auth roles", () => {
  it("allows only admin to access admin page", () => {
    expect(canAccessAdminPage("admin")).toBe(true);
    expect(canAccessAdminPage("user")).toBe(false);
    expect(canAccessAdminPage(null)).toBe(false);
  });

  it("blocks self demotion from admin to user", () => {
    expect(
      isSelfDemotionBlocked({
        actorId: "user-1",
        targetId: "user-1",
        actorRole: "admin",
        nextRole: "user",
      }),
    ).toBe(true);

    expect(
      isSelfDemotionBlocked({
        actorId: "user-1",
        targetId: "user-2",
        actorRole: "admin",
        nextRole: "user",
      }),
    ).toBe(false);
  });
});
