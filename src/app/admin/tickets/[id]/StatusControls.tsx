"use client";

import { useTransition } from "react";
import { updateTicketStatusAction, updateTicketPriorityAction } from "@/app/admin/actions";
import type { TicketStatus, TicketPriority } from "@/generated/prisma/enums";

export function StatusControls({
  ticketId,
  status,
  priority,
}: {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-4">
      <div className="field field-plain">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateTicketStatusAction(ticketId, e.target.value as TicketStatus))
          }
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_ON_CLIENT">Waiting on Client</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div className="field field-plain">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          defaultValue={priority}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateTicketPriorityAction(ticketId, e.target.value as TicketPriority))
          }
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
    </div>
  );
}
