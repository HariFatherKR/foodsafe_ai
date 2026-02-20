type TodaySafetyBannerProps = {
  hasRiskNotice: boolean;
};

export function TodaySafetyBanner({ hasRiskNotice }: TodaySafetyBannerProps) {
  return (
    <section className="story-panel story-panel--soft fade-up" role="status" aria-live="polite">
      <h2>오늘 급식 안전 상태</h2>
      <p>
        {hasRiskNotice
          ? "주의가 필요한 공지가 있습니다. 상세 내용을 확인해 주세요."
          : "현재 등록된 위험 공지가 없어 비교적 안정적인 상태입니다."}
      </p>
    </section>
  );
}
