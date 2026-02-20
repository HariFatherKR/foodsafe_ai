import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRootFile(name: string): string {
  const filePath = path.join(process.cwd(), name);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf-8");
}

describe("ralph loop bootstrap files", () => {
  it("contains operational validation commands in AGENTS.md", () => {
    const content = readRootFile("AGENTS.md");

    expect(content).toContain("pnpm test --run");
    expect(content).toContain("pnpm exec tsc --noEmit");
    expect(content).toContain("pnpm lint");
    expect(content).toContain("pnpm build");
  });

  it("contains concrete product goal in PROMPT_plan.md", () => {
    const content = readRootFile("PROMPT_plan.md");

    expect(content).toContain("ULTIMATE GOAL:");
    expect(content).not.toContain("Replace this section");
  });

  it("contains starter work items in IMPLEMENTATION_PLAN.md", () => {
    const content = readRootFile("IMPLEMENTATION_PLAN.md");

    expect(content).toContain("- [ ]");
    expect(content).not.toContain("Add prioritized implementation tasks here.");
  });
});
