type SyncStatusChipProps = {
  syncedAt: string | null;
  fromCache?: boolean;
};

export function SyncStatusChip({ syncedAt, fromCache }: SyncStatusChipProps) {
  const label = syncedAt
    ? `동기화 시각: ${new Date(syncedAt).toLocaleString("ko-KR")}`
    : "동기화 정보 없음";

  return (
    <span
      className={`pill-chip${fromCache ? " pill-chip--warning" : ""}`}
      role="status"
      aria-live="polite"
    >
      {label}
    </span>
  );
}
