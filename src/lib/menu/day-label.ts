const DAY_LABELS: Record<string, string> = {
  monday: "월요일",
  mon: "월요일",
  tuesday: "화요일",
  tue: "화요일",
  wednesday: "수요일",
  wed: "수요일",
  thursday: "목요일",
  thu: "목요일",
  friday: "금요일",
  fri: "금요일",
  saturday: "토요일",
  sat: "토요일",
  sunday: "일요일",
  sun: "일요일",
};

export function toKoreanDayLabel(day: string): string {
  const normalized = day.trim().toLowerCase();
  return DAY_LABELS[normalized] ?? day;
}
