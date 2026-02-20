import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const WORKFLOWS_DIR = path.join(process.cwd(), ".github", "workflows");

function readWorkflow(name: string): string {
  const filePath = path.join(WORKFLOWS_DIR, name);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf-8");
}

describe("workflow drafts", () => {
  it("defines fast CI checks for test/lint/typecheck", () => {
    const body = readWorkflow("ci-fast.yml");

    expect(body).toContain("pull_request");
    expect(body).toContain("pnpm test --run");
    expect(body).toContain("pnpm lint");
    expect(body).toContain("pnpm exec tsc --noEmit");
  });

  it("defines build CI check", () => {
    const body = readWorkflow("ci-build.yml");

    expect(body).toContain("pull_request");
    expect(body).toContain("pnpm build");
  });

  it("defines conditional Supabase CI check", () => {
    const body = readWorkflow("ci-supabase.yml");

    expect(body).toContain("pull_request");
    expect(body).toContain("dorny/paths-filter");
    expect(body).toContain("supabase_changed");
    expect(body).toContain("supabase/setup-cli");
  });
});
