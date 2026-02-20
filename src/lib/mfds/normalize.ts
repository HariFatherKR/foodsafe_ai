import { SourceType } from "@/types/domain";

export type MfdsRawRecord = Record<string, unknown>;

export type MfdsNormalizedRecord = {
  ingredientName: string;
  supplier?: string;
  sourceType: SourceType;
  sourceTitle: string;
  sourceDate?: string;
  sourceUrl?: string;
  raw: MfdsRawRecord;
};

const SAFE_NAME = "정보 미확인";
const SAFE_TITLE = "식약처 원천 데이터";

function pickString(record: MfdsRawRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeSourceType(raw?: string): SourceType {
  if (!raw) {
    return "administrative";
  }

  const text = raw.toLowerCase();
  if (
    text.includes("recall") ||
    text.includes("회수") ||
    text.includes("리콜")
  ) {
    return "recall";
  }

  return "administrative";
}

export function normalizeMfdsRecord(record: MfdsRawRecord): MfdsNormalizedRecord {
  const ingredientName =
    pickString(record, ["PRDLST_NM", "ingredientName", "productName"]) ??
    SAFE_NAME;

  const supplier = pickString(record, ["BSSH_NM", "supplier", "maker"]);
  const rawSourceType = pickString(record, ["PRDT_TYPE", "sourceType"]);
  const sourceType = normalizeSourceType(rawSourceType);
  const sourceTitle =
    pickString(record, ["TITLE", "sourceTitle", "RPRSNTV_CN"]) ?? SAFE_TITLE;
  const sourceDate = pickString(record, ["CRTFC_DATE", "sourceDate", "DATE"]);
  const sourceUrl = pickString(record, ["LINK_URL", "sourceUrl", "URL"]);

  return {
    ingredientName,
    supplier,
    sourceType,
    sourceTitle,
    sourceDate,
    sourceUrl,
    raw: record,
  };
}

export function normalizeMfdsRecords(
  records: MfdsRawRecord[],
): MfdsNormalizedRecord[] {
  return records.map((record) => normalizeMfdsRecord(record));
}
