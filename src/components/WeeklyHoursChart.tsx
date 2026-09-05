import type { WeeklyHours } from "@/lib/reports";

export function WeeklyHoursChart({ weeks }: { weeks: WeeklyHours[] }) {
  if (weeks.length === 0) {
    return <p className="text-sm text-[var(--text-3)]">No hours logged yet.</p>;
  }

  const recent = weeks.slice(-8);
  const max = Math.max(...recent.map((w) => w.hours), 1);

  return (
    <div className="flex items-end gap-2.5 overflow-x-auto pb-1" style={{ height: 120 }}>
      {recent.map((w) => {
        const barHeight = Math.max((w.hours / max) * 92, w.hours > 0 ? 6 : 2);
        return (
          <div key={w.weekStart.toISOString()} className="flex flex-1 min-w-[34px] flex-col items-center gap-1.5">
            <span className="text-[.68rem] font-semibold text-[var(--text-2)]">
              {w.hours > 0 ? w.hours : ""}
            </span>
            <div className="flex h-[92px] w-full items-end">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: barHeight,
                  background: "linear-gradient(180deg, var(--blue-light), var(--blue))",
                  boxShadow: "0 4px 14px -4px rgba(59,130,246,.5)",
                }}
              />
            </div>
            <span className="text-[.62rem] uppercase tracking-wide text-[var(--text-3)]">
              {w.weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
