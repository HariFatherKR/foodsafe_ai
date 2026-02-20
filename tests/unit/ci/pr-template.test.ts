import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("pull request template", () => {
  it("defines required reviewer and verification checklist", () => {
    const filePath = path.join(process.cwd(), ".github", "pull_request_template.md");
    expect(existsSync(filePath)).toBe(true);

    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain("검토자");
    expect(content).toContain("pnpm test --run");
    expect(content).toContain("pnpm lint");
    expect(content).toContain("pnpm build");
    expect(content).toContain("Vercel Preview");
  });
});
