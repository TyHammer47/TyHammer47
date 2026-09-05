import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { NewTicketForm } from "./NewTicketForm";
import { NewTaskForm } from "./NewTaskForm";
import { AddClientUserForm } from "./AddClientUserForm";
import { toggleTaskAction, deleteTaskAction } from "@/app/admin/actions";

export default async function CompanyDetailPage({ params }: PageProps<"/admin/companies/[id]">) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: { where: { role: "CLIENT" }, orderBy: { createdAt: "asc" } },
      tickets: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: [{ done: "asc" }, { position: "asc" }] },
    },
  });

  if (!company) notFound();

  const openTickets = company.tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED");
  const closedTickets = company.tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");

  return (
    <div>
      <Link href="/admin" className="text-sm text-[var(--text-3)] hover:text-[var(--text)]">
        ← All companies
      </Link>

      <div className="mt-3 mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="serif-italic text-[2.2rem]">{company.name}</h1>
          {company.domain && (
            <a
              href={company.domain.startsWith("http") ? company.domain : `https://${company.domain}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-[var(--blue-light)] hover:underline"
            >
              {company.domain}
            </a>
          )}
        </div>
        <div className="panel px-5 py-4 text-sm text-[var(--text-2)]">
          {company.contactName && <div>{company.contactName}</div>}
          {company.contactEmail && <div className="text-[var(--text-3)]">{company.contactEmail}</div>}
          {company.contactPhone && <div className="text-[var(--text-3)]">{company.contactPhone}</div>}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-10">
          {/* Tickets */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Tickets</h2>
            <div className="flex flex-col gap-3">
              {openTickets.length === 0 && closedTickets.length === 0 && (
                <p className="panel px-6 py-8 text-center text-sm text-[var(--text-3)]">
                  No tickets yet for this company.
                </p>
              )}
              {openTickets.map((t) => (
                <TicketRow key={t.id} ticket={t} />
              ))}
              {closedTickets.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-[var(--text-3)] hover:text-[var(--text)]">
                    {closedTickets.length} resolved / closed ticket{closedTickets.length === 1 ? "" : "s"}
                  </summary>
                  <div className="mt-3 flex flex-col gap-3">
                    {closedTickets.map((t) => (
                      <TicketRow key={t.id} ticket={t} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </section>

          {/* Task tracker */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Task tracker</h2>
            <div className="panel px-6 py-6">
              <NewTaskForm companyId={company.id} />
              <ul className="mt-5 flex flex-col gap-2">
                {company.tasks.length === 0 && (
                  <li className="py-4 text-center text-sm text-[var(--text-3)]">No tasks yet.</li>
                )}
                {company.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3"
                  >
                    <form action={toggleTaskAction.bind(null, task.id, !task.done)}>
                      <button
                        type="submit"
                        aria-label={task.done ? "Mark as not done" : "Mark as done"}
                        className="flex h-5 w-5 items-center justify-center rounded-md border-2"
                        style={{
                          borderColor: task.done ? "var(--blue)" : "var(--line-strong)",
                          background: task.done ? "var(--blue)" : "transparent",
                        }}
                      >
                        {task.done && (
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}>
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    </form>
                    <span
                      className="flex-1 text-sm"
                      style={{
                        color: task.done ? "var(--text-3)" : "var(--text)",
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-[var(--text-3)]">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <form action={deleteTaskAction.bind(null, task.id)}>
                      <button
                        type="submit"
                        aria-label="Delete task"
                        className="text-[var(--text-3)] transition-colors hover:text-[#fca5a5]"
                      >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                        </svg>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section className="panel px-6 py-6">
            <h2 className="mb-4 text-lg font-semibold">New ticket</h2>
            <NewTicketForm companyId={company.id} />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Client logins</h2>
            <div className="flex flex-col gap-3">
              {company.users.map((u) => (
                <div key={u.id} className="panel flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="text-sm font-medium text-[var(--text)]">{u.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{u.email}</div>
                  </div>
                </div>
              ))}
              <AddClientUserForm companyId={company.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TicketRow({
  ticket,
}: {
  ticket: {
    id: string;
    number: number;
    subject: string;
    status: import("@/generated/prisma/enums").TicketStatus;
    priority: import("@/generated/prisma/enums").TicketPriority;
    createdAt: Date;
  };
}) {
  return (
    <Link
      href={`/admin/tickets/${ticket.id}`}
      className="panel panel-hover flex flex-wrap items-center gap-3 px-5 py-4"
    >
      <span className="text-xs font-semibold text-[var(--text-3)]">#{ticket.number}</span>
      <span className="flex-1 font-medium text-[var(--text)]">{ticket.subject}</span>
      <PriorityBadge priority={ticket.priority} />
      <StatusBadge status={ticket.status} />
      <span className="w-full text-xs text-[var(--text-3)] sm:w-auto">
        {new Date(ticket.createdAt).toLocaleDateString()}
      </span>
    </Link>
  );
}
