import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type BranchProtectionPayload = {
  required_pull_request_reviews?: {
    required_approving_review_count?: number;
  } | null;
};

describe("branch protection payload", () => {
  it("requires at least one approving review", () => {
    const filePath = path.join(
      process.cwd(),
      "docs",
      "runbooks",
      "branch-protection.payload.json",
    );
    expect(existsSync(filePath)).toBe(true);

    const payload = JSON.parse(readFileSync(filePath, "utf-8")) as BranchProtectionPayload;
    expect(
      payload.required_pull_request_reviews?.required_approving_review_count,
    ).toBeGreaterThanOrEqual(1);
  });
});
