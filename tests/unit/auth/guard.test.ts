import { describe, expect, it } from "vitest";
import {
  buildLoginRedirect,
  isPublicPath,
  normalizeNextPath,
} from "@/lib/auth/guard";

describe("auth guard", () => {
  it("treats auth routes and next assets as public", () => {
    expect(isPublicPath("/auth/login")).toBe(true);
    expect(isPublicPath("/auth/callback")).toBe(true);
    expect(isPublicPath("/_next/static/chunk.js")).toBe(true);
    expect(isPublicPath("/favicon.ico")).toBe(true);
    expect(isPublicPath("/images/icon.png")).toBe(true);
    expect(isPublicPath("/nutritionist")).toBe(false);
    expect(isPublicPath("/api/parent/feed")).toBe(false);
  });

  it("builds login redirect with encoded next parameter", () => {
    expect(buildLoginRedirect("/nutritionist", "")).toBe(
      "/auth/login?next=%2Fnutritionist",
    );
    expect(buildLoginRedirect("/", "?tab=1")).toBe(
      "/auth/login?next=%2F%3Ftab%3D1",
    );
  });

  it("normalizes next path to safe relative routes", () => {
    expect(normalizeNextPath("/nutritionist")).toBe("/nutritionist");
    expect(normalizeNextPath("/nutritionist?x=1")).toBe("/nutritionist?x=1");
    expect(normalizeNextPath("https://evil.com/phish")).toBe("/");
    expect(normalizeNextPath("//evil.com")).toBe("/");
    expect(normalizeNextPath("javascript:alert(1)")).toBe("/");
  });
});
