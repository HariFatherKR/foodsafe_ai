import { describe, expect, it } from "vitest";
import { middleware } from "../../middleware";

describe("middleware open access", () => {
  it("does not redirect protected pages", async () => {
    const response = await middleware();

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
