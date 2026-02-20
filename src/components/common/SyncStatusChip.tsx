type SyncStatusChipProps = {
  syncedAt: string | null;
  fromCache?: boolean;
  language?: "ko" | "en";
};

export function SyncStatusChip({
  syncedAt,
  fromCache,
  language = "ko",
}: SyncStatusChipProps) {
  const locale = language === "en" ? "en-US" : "ko-KR";
  const syncedPrefix = language === "en" ? "Synced At" : "동기화 시각";
  const fallbackLabel = language === "en" ? "Sync Not Available" : "동기화 정보 없음";
  const label = syncedAt
    ? `${syncedPrefix}: ${new Date(syncedAt).toLocaleString(locale)}`
    : fallbackLabel;

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
