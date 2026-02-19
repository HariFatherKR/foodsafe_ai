import {
  MfdsNormalizedRecord,
  MfdsRawRecord,
  normalizeMfdsRecords,
} from "@/lib/mfds/normalize";

type FetchOptions = {
  endpoint?: string;
  query?: Record<string, string | number | undefined>;
};

function toSearchParams(query: FetchOptions["query"]): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }

  const apiKey = process.env.MFDS_API_KEY;
  if (apiKey) {
    params.set("serviceKey", apiKey);
  }

  return params;
}

function extractItems(payload: unknown): MfdsRawRecord[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const maybeItems =
    (root.items as unknown[]) ??
    (((root.body as Record<string, unknown> | undefined)?.items as
      | unknown[]
      | undefined) ??
      ((root.data as Record<string, unknown> | undefined)?.items as
        | unknown[]
        | undefined));

  if (!Array.isArray(maybeItems)) {
    return [];
  }

  return maybeItems.filter(
    (item): item is MfdsRawRecord => Boolean(item && typeof item === "object"),
  );
}

export async function fetchMfdsRecords(
  options: FetchOptions = {},
): Promise<MfdsRawRecord[]> {
  const baseUrl =
    process.env.MFDS_API_BASE_URL ?? "https://apis.data.go.kr/1471000";
  const endpoint = options.endpoint ?? "/MfdsRecallService/getMfdsRecall";
  const params = toSearchParams(options.query);
  const url = `${baseUrl}${endpoint}${params.toString() ? `?${params}` : ""}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`MFDS request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return extractItems(payload);
}

export async function fetchNormalizedMfdsRecords(
  options: FetchOptions = {},
): Promise<MfdsNormalizedRecord[]> {
  const records = await fetchMfdsRecords(options);
  return normalizeMfdsRecords(records);
}
