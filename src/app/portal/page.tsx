import Link from "next/link";
import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { NewTicketForm } from "./NewTicketForm";

export default async function PortalDashboard() {
  const user = await requireClient();

  const tickets = await prisma.ticket.findMany({
    where: { companyId: user.companyId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
            {user.company?.name}
          </p>
          <h1 className="serif-italic mt-2 text-[2.1rem]">Your support tickets</h1>
        </div>
        <NewTicketForm />
      </div>

      <div className="flex flex-col gap-3">
        {tickets.length === 0 && (
          <div className="panel px-8 py-14 text-center text-[var(--text-3)]">
            No tickets yet. Submit one whenever you need help.
          </div>
        )}
        {tickets.map((t) => (
          <Link
            key={t.id}
            href={`/portal/tickets/${t.id}`}
            className="panel panel-hover flex flex-wrap items-center gap-3 px-5 py-4"
          >
            <span className="text-xs font-semibold text-[var(--text-3)]">#{t.number}</span>
            <span className="flex-1 font-medium text-[var(--text)]">{t.subject}</span>
            <PriorityBadge priority={t.priority} />
            <StatusBadge status={t.status} />
            <span className="w-full text-xs text-[var(--text-3)] sm:w-auto">
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
