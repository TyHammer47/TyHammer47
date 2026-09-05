import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { tickets: true, tasks: true } },
      tickets: { where: { status: { notIn: ["RESOLVED", "CLOSED"] } }, select: { id: true } },
      tasks: { where: { done: false }, select: { id: true } },
    },
  });

  const totalOpen = companies.reduce((sum, c) => sum + c.tickets.length, 0);

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
            Engineer Console
          </p>
          <h1 className="serif-italic mt-2 text-[2.2rem]">Your companies</h1>
        </div>
        <Link href="/admin/companies/new" className="btn btn-primary">
          + New company
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="panel px-6 py-5">
          <div className="serif-italic text-[1.8rem]">{companies.length}</div>
          <div className="text-xs uppercase tracking-[.12em] text-[var(--text-3)]">Companies</div>
        </div>
        <div className="panel px-6 py-5">
          <div className="serif-italic text-[1.8rem]">{totalOpen}</div>
          <div className="text-xs uppercase tracking-[.12em] text-[var(--text-3)]">Open tickets</div>
        </div>
        <div className="panel px-6 py-5">
          <div className="serif-italic text-[1.8rem]">
            {companies.reduce((sum, c) => sum + c.tasks.length, 0)}
          </div>
          <div className="text-xs uppercase tracking-[.12em] text-[var(--text-3)]">Open tasks</div>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="panel px-8 py-14 text-center text-[var(--text-3)]">
          No companies yet. Add your first client to start tracking tickets and tasks.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/admin/companies/${c.id}`}
              className="panel panel-hover flex flex-col gap-4 px-6 py-6"
            >
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">{c.name}</h2>
                {c.domain && <p className="mt-1 text-sm text-[var(--text-3)]">{c.domain}</p>}
              </div>
              <div className="mt-auto flex items-center gap-4 border-t border-[var(--line)] pt-4 text-sm">
                <span className="text-[var(--text-2)]">
                  <b className="text-[var(--blue-light)]">{c.tickets.length}</b> open tickets
                </span>
                <span className="text-[var(--text-2)]">
                  <b className="text-[var(--blue-light)]">{c.tasks.length}</b> tasks
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
