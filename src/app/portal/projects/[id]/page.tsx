import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/session";
import { groupHoursByWeek } from "@/lib/reports";
import { WeeklyHoursChart } from "@/components/WeeklyHoursChart";
import { ProgressBar } from "@/components/ProgressBar";
import { ProjectStatusBadge } from "@/components/Badges";

export default async function ClientProjectDetailPage({ params }: PageProps<"/portal/projects/[id]">) {
  const user = await requireClient();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { timeEntries: { orderBy: { workDate: "desc" } } },
  });

  if (!project || project.companyId !== user.companyId) notFound();

  const totalHours = project.timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const weeks = groupHoursByWeek(project.timeEntries.map((e) => ({ workDate: e.workDate, hours: e.hours })));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/projects" className="text-sm text-[var(--text-3)] hover:text-[var(--text)]">
        ← Your projects
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="serif-italic mt-1 text-[2rem]">{project.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          {project.targetDate && (
            <span className="text-xs text-[var(--text-3)]">
              Target: {new Date(project.targetDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {project.description && (
        <div className="panel mb-6 px-6 py-6">
          <p className="whitespace-pre-wrap text-[var(--text-2)]">{project.description}</p>
        </div>
      )}

      <div className="panel mb-8 px-6 py-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-3)]">Progress</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar percent={project.progressPercent} height={10} />
          </div>
          <span className="serif-italic text-lg text-[var(--blue-light)]">{project.progressPercent}%</span>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="panel px-6 py-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-3)]">
            Hours logged
          </p>
          <p className="serif-italic text-[1.8rem]">
            {totalHours}
            {project.estimatedHours ? <span className="text-[var(--text-3)]"> / {project.estimatedHours}</span> : ""}
          </p>
        </div>
        <div className="panel px-6 py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-3)]">
            Hours by week
          </p>
          <WeeklyHoursChart weeks={weeks} />
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Activity</h2>
      <div className="flex flex-col gap-2">
        {project.timeEntries.length === 0 && (
          <p className="panel px-6 py-8 text-center text-sm text-[var(--text-3)]">No hours logged yet.</p>
        )}
        {project.timeEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3"
          >
            <span className="text-xs font-semibold text-[var(--text-3)]">
              {new Date(entry.workDate).toLocaleDateString()}
            </span>
            <span className="text-sm font-semibold text-[var(--blue-light)]">{entry.hours}h</span>
            <span className="flex-1 text-sm text-[var(--text-2)]">{entry.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
