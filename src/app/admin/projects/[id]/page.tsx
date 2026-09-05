import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { groupHoursByWeek } from "@/lib/reports";
import { WeeklyHoursChart } from "@/components/WeeklyHoursChart";
import { ProgressBar } from "@/components/ProgressBar";
import { ProjectControls } from "./ProjectControls";
import { AddTimeEntryForm } from "./AddTimeEntryForm";
import { deleteTimeEntryAction, deleteProjectAction } from "@/app/admin/actions";

export default async function AdminProjectDetailPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      company: true,
      timeEntries: { orderBy: { workDate: "desc" } },
    },
  });

  if (!project) notFound();

  const totalHours = project.timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const budgetPercent = project.estimatedHours ? Math.min(100, (totalHours / project.estimatedHours) * 100) : null;
  const weeks = groupHoursByWeek(project.timeEntries.map((e) => ({ workDate: e.workDate, hours: e.hours })));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/companies/${project.companyId}`}
        className="text-sm text-[var(--text-3)] hover:text-[var(--text)]"
      >
        ← {project.company.name}
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--text-3)]">Project</p>
          <h1 className="serif-italic mt-1 text-[2rem]">{project.name}</h1>
          {project.targetDate && (
            <p className="mt-1 text-sm text-[var(--text-3)]">
              Target: {new Date(project.targetDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <form action={deleteProjectAction.bind(null, project.id)}>
          <button type="submit" className="btn btn-danger btn-sm">
            Delete project
          </button>
        </form>
      </div>

      {project.description && (
        <div className="panel mb-6 px-6 py-6">
          <p className="whitespace-pre-wrap text-[var(--text-2)]">{project.description}</p>
        </div>
      )}

      <div className="panel mb-8 px-6 py-6">
        <ProjectControls projectId={project.id} status={project.status} progressPercent={project.progressPercent} />
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
          {budgetPercent !== null && (
            <div className="mt-3">
              <ProgressBar percent={budgetPercent} color="var(--amber)" />
              <p className="mt-1 text-xs text-[var(--text-3)]">{Math.round(budgetPercent)}% of estimated budget</p>
            </div>
          )}
        </div>
        <div className="panel px-6 py-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-3)]">
            Hours by week
          </p>
          <WeeklyHoursChart weeks={weeks} />
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Log time</h2>
        <div className="panel mb-6 px-6 py-6">
          <AddTimeEntryForm projectId={project.id} />
        </div>

        <h2 className="mb-4 text-lg font-semibold">Time entries</h2>
        <div className="flex flex-col gap-2">
          {project.timeEntries.length === 0 && (
            <p className="panel px-6 py-8 text-center text-sm text-[var(--text-3)]">No time logged yet.</p>
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
              <form action={deleteTimeEntryAction.bind(null, entry.id)}>
                <button
                  type="submit"
                  aria-label="Delete time entry"
                  className="text-[var(--text-3)] transition-colors hover:text-[#fca5a5]"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
