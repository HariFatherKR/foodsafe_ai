import { describe, expect, it } from "vitest";
import {
  normalizeMfdsRecord,
  normalizeMfdsRecords,
  type MfdsRawRecord,
} from "@/lib/mfds/normalize";

describe("normalizeMfdsRecord", () => {
  it("normalizes known fields", () => {
    const raw: MfdsRawRecord = {
      PRDLST_NM: "Frozen Milk",
      BSSH_NM: "SafeFoods",
      PRDT_TYPE: "recall",
      CRTFC_DATE: "2026-02-16",
      LINK_URL: "https://example.com/r1",
      TITLE: "Recall notice",
    };

    const normalized = normalizeMfdsRecord(raw);
    expect(normalized.ingredientName).toBe("Frozen Milk");
    expect(normalized.sourceType).toBe("recall");
    expect(normalized.sourceDate).toBe("2026-02-16");
    expect(normalized.sourceUrl).toBe("https://example.com/r1");
    expect(normalized.sourceTitle).toBe("Recall notice");
  });

  it("falls back to safe defaults for missing fields", () => {
    const normalized = normalizeMfdsRecord({});
    expect(normalized.ingredientName).toBe("정보 미확인");
    expect(normalized.sourceType).toBe("administrative");
    expect(normalized.sourceTitle).toBe("식약처 원천 데이터");
  });

  it("normalizes arrays", () => {
    const records = normalizeMfdsRecords([{ PRDLST_NM: "Egg" }, {}]);
    expect(records).toHaveLength(2);
    expect(records[0]?.ingredientName).toBe("Egg");
  });
});
