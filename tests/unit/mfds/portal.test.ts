import { describe, expect, it } from "vitest";
import { parseMfdsPortalDatasetsFromHtml } from "@/lib/mfds/portal";

describe("parseMfdsPortalDatasetsFromHtml", () => {
  it("extracts dataset payloads from datUtlzGdDown markup", () => {
    const html = `
      <button onclick="datUtlzGdDown({&quot;srvcSn&quot;:1045,&quot;srvcNm&quot;:&quot;FoodRstrtLcnsChgInfo&quot;,&quot;srvcKrNm&quot;:&quot;음식점 업소 인허가 변경 정보&quot;,&quot;openapiYn&quot;:&quot;Y&quot;,&quot;openYmd&quot;:&quot;2025-07-01&quot;,&quot;cdNm&quot;:&quot;식품&quot;,&quot;cdDtlNm&quot;:&quot;식품&quot;,&quot;deptInsttNm&quot;:&quot;식품의약품안전처&quot;,&quot;useAplyLnk&quot;:&quot;https:\\/\\/www.data.go.kr\\/data\\/15145167\\/openapi.do&quot;,&quot;srvcExplain&quot;:&quot;설명A&quot;})">x</button>
      <button onclick="datUtlzGdDown({&quot;srvcSn&quot;:1044,&quot;srvcNm&quot;:&quot;HtfsLcnsChgInfo&quot;,&quot;srvcKrNm&quot;:&quot;건강기능식품업소 인허가 변경 정보&quot;,&quot;openapiYn&quot;:&quot;Y&quot;,&quot;openYmd&quot;:&quot;2025-06-01&quot;,&quot;cdNm&quot;:&quot;식품&quot;,&quot;cdDtlNm&quot;:&quot;건강기능식품&quot;,&quot;deptInsttNm&quot;:&quot;식품의약품안전처&quot;,&quot;useAplyLnk&quot;:&quot;https:\\/\\/www.data.go.kr\\/data\\/15145159\\/openapi.do&quot;,&quot;srvcExplain&quot;:&quot;설명B&quot;})">x</button>
    `;

    const datasets = parseMfdsPortalDatasetsFromHtml(html);

    expect(datasets).toHaveLength(2);
    expect(datasets[0]).toEqual(
      expect.objectContaining({
        srvcSn: 1045,
        serviceCode: "FoodRstrtLcnsChgInfo",
        serviceName: "음식점 업소 인허가 변경 정보",
        openApi: true,
      }),
    );
  });

  it("deduplicates duplicated srvcSn values", () => {
    const html = `
      <button onclick="datUtlzGdDown({&quot;srvcSn&quot;:1,&quot;srvcNm&quot;:&quot;A&quot;,&quot;srvcKrNm&quot;:&quot;A&quot;,&quot;openapiYn&quot;:&quot;Y&quot;,&quot;openYmd&quot;:&quot;2025-01-01&quot;,&quot;cdNm&quot;:&quot;식품&quot;,&quot;cdDtlNm&quot;:&quot;식품&quot;,&quot;deptInsttNm&quot;:&quot;식품의약품안전처&quot;,&quot;useAplyLnk&quot;:&quot;https:\\/\\/example.com\\/a&quot;,&quot;srvcExplain&quot;:&quot;A&quot;})">x</button>
      <button onclick="datUtlzGdDown({&quot;srvcSn&quot;:1,&quot;srvcNm&quot;:&quot;A&quot;,&quot;srvcKrNm&quot;:&quot;A&quot;,&quot;openapiYn&quot;:&quot;Y&quot;,&quot;openYmd&quot;:&quot;2025-01-01&quot;,&quot;cdNm&quot;:&quot;식품&quot;,&quot;cdDtlNm&quot;:&quot;식품&quot;,&quot;deptInsttNm&quot;:&quot;식품의약품안전처&quot;,&quot;useAplyLnk&quot;:&quot;https:\\/\\/example.com\\/a&quot;,&quot;srvcExplain&quot;:&quot;A&quot;})">x</button>
    `;

    const datasets = parseMfdsPortalDatasetsFromHtml(html);
    expect(datasets).toHaveLength(1);
  });
});
