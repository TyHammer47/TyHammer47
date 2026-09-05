function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type WeeklyHours = { weekStart: Date; hours: number };

export function groupHoursByWeek(entries: { workDate: Date; hours: number }[]): WeeklyHours[] {
  const buckets = new Map<string, WeeklyHours>();

  for (const entry of entries) {
    const weekStart = getWeekStart(entry.workDate);
    const key = weekStart.toISOString();
    const existing = buckets.get(key);
    if (existing) {
      existing.hours += entry.hours;
    } else {
      buckets.set(key, { weekStart, hours: entry.hours });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}
