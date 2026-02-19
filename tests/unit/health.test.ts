import { describe, expect, it } from "vitest";
import { getHealthStatus } from "@/lib/health";

describe("getHealthStatus", () => {
  it("returns ok payload", () => {
    expect(getHealthStatus()).toEqual({ status: "ok" });
  });
});
