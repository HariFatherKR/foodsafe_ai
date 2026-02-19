import { execFile } from "node:child_process";
import { promisify } from "node:util";

const MFDS_DATASET_SOURCE_URL =
  "https://data.mfds.go.kr/OPCAA01F01/search?selectedTab=tab2&allChk=Y&taskDivsCd=2&taskDivsCd=3&taskDivsCd=8&taskDivsCd=4&taskDivsCd=9&srchSrvcSeCd=2&srchSortSection=NEW";
const execFileAsync = promisify(execFile);

type RawPortalDataset = {
  srvcSn: number;
  srvcNm: string;
  srvcKrNm: string;
  openapiYn: "Y" | "N";
  openYmd?: string;
  cdNm?: string;
  cdDtlNm?: string;
  deptInsttNm?: string;
  useAplyLnk?: string;
  srvcExplain?: string | null;
};

export type MfdsPortalDataset = {
  srvcSn: number;
  serviceCode: string;
  serviceName: string;
  openApi: boolean;
  openedAt: string | null;
  category: string | null;
  subCategory: string | null;
  provider: string | null;
  usageLink: string | null;
  description: string | null;
  sourcePageUrl: string;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function toNormalizedDataset(raw: RawPortalDataset): MfdsPortalDataset {
  return {
    srvcSn: raw.srvcSn,
    serviceCode: raw.srvcNm,
    serviceName: raw.srvcKrNm,
    openApi: raw.openapiYn === "Y",
    openedAt: raw.openYmd ?? null,
    category: raw.cdNm ?? null,
    subCategory: raw.cdDtlNm ?? null,
    provider: raw.deptInsttNm ?? null,
    usageLink: raw.useAplyLnk ?? null,
    description: raw.srvcExplain ?? null,
    sourcePageUrl: MFDS_DATASET_SOURCE_URL,
  };
}

export function parseMfdsPortalDatasetsFromHtml(html: string): MfdsPortalDataset[] {
  const matches = html.matchAll(/datUtlzGdDown\((\{&quot;[\s\S]*?\})\)/g);
  const datasets: MfdsPortalDataset[] = [];
  const seen = new Set<number>();

  for (const match of matches) {
    const encodedJson = match[1];
    if (!encodedJson) {
      continue;
    }

    const decodedJson = decodeHtmlEntities(encodedJson);

    try {
      const raw = JSON.parse(decodedJson) as RawPortalDataset;
      if (!raw.srvcSn || seen.has(raw.srvcSn)) {
        continue;
      }

      seen.add(raw.srvcSn);
      datasets.push(toNormalizedDataset(raw));
    } catch {
      continue;
    }
  }

  return datasets;
}

async function fetchMfdsPortalHtmlByCurl(): Promise<string> {
  const { stdout } = await execFileAsync("curl", ["-L", "-sS", MFDS_DATASET_SOURCE_URL], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout;
}

export async function fetchMfdsPortalDatasets(): Promise<MfdsPortalDataset[]> {
  let html = "";

  try {
    const response = await fetch(MFDS_DATASET_SOURCE_URL, {
      cache: "no-store",
      headers: {
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`MFDS portal request failed: ${response.status}`);
    }

    html = await response.text();
  } catch {
    // MFDS 응답 헤더가 비표준인 경우 Node fetch가 실패할 수 있어 curl fallback을 사용한다.
    html = await fetchMfdsPortalHtmlByCurl();
  }

  return parseMfdsPortalDatasetsFromHtml(html);
}
