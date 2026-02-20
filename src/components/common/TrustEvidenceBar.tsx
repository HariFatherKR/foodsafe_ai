type TrustEvidenceBarProps = {
  syncedAt: string | null;
  fromCache?: boolean;
};

export function TrustEvidenceBar({ syncedAt, fromCache }: TrustEvidenceBarProps) {
  const syncedLabel = syncedAt
    ? new Date(syncedAt).toLocaleString("ko-KR")
    : "동기화 정보 없음";

  return (
    <section className="trust-evidence fade-up" role="status" aria-live="polite">
      <span className="trust-evidence__item">데이터 출처: 식약처 공개데이터</span>
      <span className="trust-evidence__item">최종 동기화: {syncedLabel}</span>
      <span className={`trust-evidence__item${fromCache ? " trust-evidence__item--warning" : ""}`}>
        {fromCache ? "캐시 모드 활성" : "실시간 응답 모드"}
      </span>
    </section>
  );
}
