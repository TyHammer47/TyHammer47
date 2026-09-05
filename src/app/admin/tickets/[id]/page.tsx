import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusControls } from "./StatusControls";
import { CommentForm } from "./CommentForm";

export default async function AdminTicketDetailPage({ params }: PageProps<"/admin/tickets/[id]">) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      company: true,
      createdBy: true,
      comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/companies/${ticket.companyId}`}
        className="text-sm text-[var(--text-3)] hover:text-[var(--text)]"
      >
        ← {ticket.company.name}
      </Link>

      <div className="mt-3 mb-6">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--text-3)]">
          Ticket #{ticket.number}
        </p>
        <h1 className="serif-italic mt-1 text-[2rem]">{ticket.subject}</h1>
      </div>

      <div className="panel mb-6 px-6 py-6">
        <StatusControls ticketId={ticket.id} status={ticket.status} priority={ticket.priority} />
      </div>

      <div className="panel mb-8 px-6 py-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.1em] text-[var(--text-3)]">
          Opened by {ticket.createdBy.name} · {new Date(ticket.createdAt).toLocaleString()}
        </p>
        <p className="whitespace-pre-wrap text-[var(--text-2)]">{ticket.description}</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Activity</h2>
      <div className="mb-8 flex flex-col gap-4">
        {ticket.comments.length === 0 && (
          <p className="text-sm text-[var(--text-3)]">No replies yet.</p>
        )}
        {ticket.comments.map((c) => (
          <div key={c.id} className="panel px-5 py-4">
            <p className="mb-1 text-xs font-semibold text-[var(--text-3)]">
              {c.author.name} · {new Date(c.createdAt).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap text-sm text-[var(--text-2)]">{c.body}</p>
          </div>
        ))}
      </div>

      <CommentForm ticketId={ticket.id} />
    </div>
  );
}
