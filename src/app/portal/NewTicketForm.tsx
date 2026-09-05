"use client";

import { useActionState, useState } from "react";
import { createClientTicketAction } from "./actions";

export function NewTicketForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createClientTicketAction, {});

  const [wasPending, setWasPending] = useState(pending);
  if (pending !== wasPending) {
    setWasPending(pending);
    if (wasPending && !pending && !state.error) {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        + New ticket
      </button>
    );
  }

  return (
    <form action={formAction} className="panel flex flex-col gap-4 px-6 py-6">
      <div className="field">
        <input id="subject" name="subject" placeholder=" " required />
        <label htmlFor="subject">Subject</label>
      </div>
      <div className="field">
        <textarea id="description" name="description" placeholder=" " required />
        <label htmlFor="description">Tell us what&apos;s going on</label>
      </div>
      <div className="field field-plain">
        <label htmlFor="priority">How urgent is this?</label>
        <select id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">Low — whenever you get a chance</option>
          <option value="MEDIUM">Medium — normal priority</option>
          <option value="HIGH">High — impacting our work</option>
          <option value="URGENT">Urgent — we&apos;re stuck right now</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-[#fca5a5]">{state.error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Submitting…" : "Submit ticket"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
