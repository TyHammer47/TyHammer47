import type { TicketStatus, TicketPriority } from "@/generated/prisma/enums";

const STATUS_STYLES: Record<TicketStatus, { label: string; color: string; bg: string; border: string }> = {
  OPEN: { label: "Open", color: "#60a5fa", bg: "rgba(59,130,246,.12)", border: "rgba(59,130,246,.3)" },
  IN_PROGRESS: { label: "In Progress", color: "#fbbf24", bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.3)" },
  WAITING_ON_CLIENT: { label: "Waiting on Client", color: "#c084fc", bg: "rgba(192,132,252,.12)", border: "rgba(192,132,252,.3)" },
  RESOLVED: { label: "Resolved", color: "#34d399", bg: "rgba(52,211,153,.12)", border: "rgba(52,211,153,.3)" },
  CLOSED: { label: "Closed", color: "#7c8089", bg: "rgba(124,128,137,.14)", border: "rgba(124,128,137,.3)" },
};

const PRIORITY_STYLES: Record<TicketPriority, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: "Low", color: "#7c8089", bg: "rgba(124,128,137,.14)", border: "rgba(124,128,137,.3)" },
  MEDIUM: { label: "Medium", color: "#60a5fa", bg: "rgba(59,130,246,.12)", border: "rgba(59,130,246,.3)" },
  HIGH: { label: "High", color: "#fbbf24", bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.3)" },
  URGENT: { label: "Urgent", color: "#f87171", bg: "rgba(248,113,113,.14)", border: "rgba(248,113,113,.35)" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="pill"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="pill-dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const p = PRIORITY_STYLES[priority];
  return (
    <span
      className="pill"
      style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
    >
      {p.label}
    </span>
  );
}

export { STATUS_STYLES, PRIORITY_STYLES };
