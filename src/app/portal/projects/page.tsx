import Link from "next/link";
import { requireClient } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProjectStatusBadge } from "@/components/Badges";
import { ProgressBar } from "@/components/ProgressBar";

export default async function PortalProjectsPage() {
  const user = await requireClient();

  const projects = await prisma.project.findMany({
    where: { companyId: user.companyId! },
    orderBy: { createdAt: "desc" },
    include: { timeEntries: { select: { hours: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
          {user.company?.name}
        </p>
        <h1 className="serif-italic mt-2 text-[2.1rem]">Your projects</h1>
      </div>

      <div className="flex flex-col gap-3">
        {projects.length === 0 && (
          <div className="panel px-8 py-14 text-center text-[var(--text-3)]">
            No active projects right now — larger, multi-step work will show up here.
          </div>
        )}
        {projects.map((p) => {
          const totalHours = p.timeEntries.reduce((sum, e) => sum + e.hours, 0);
          return (
            <Link key={p.id} href={`/portal/projects/${p.id}`} className="panel panel-hover flex flex-col gap-3 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1 font-medium text-[var(--text)]">{p.name}</span>
                <ProjectStatusBadge status={p.status} />
                {p.targetDate && (
                  <span className="text-xs text-[var(--text-3)]">
                    Due {new Date(p.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar percent={p.progressPercent} />
                </div>
                <span className="text-xs font-semibold text-[var(--blue-light)]">{p.progressPercent}%</span>
                <span className="text-xs text-[var(--text-3)]">
                  {totalHours}
                  {p.estimatedHours ? ` / ${p.estimatedHours}h` : "h logged"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
