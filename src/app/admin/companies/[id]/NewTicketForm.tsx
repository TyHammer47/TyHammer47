"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTicketAsAdminAction } from "@/app/admin/actions";

export function NewTicketForm({ companyId }: { companyId: string }) {
  const [state, formAction, pending] = useActionState(createTicketAsAdminAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="field">
        <input id="subject" name="subject" placeholder=" " required />
        <label htmlFor="subject">Subject</label>
      </div>
      <div className="field">
        <textarea id="description" name="description" placeholder=" " required />
        <label htmlFor="description">What&apos;s the issue?</label>
      </div>
      <div className="field field-plain">
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {state.error && (
        <p className="rounded-[var(--radius-s)] border border-[rgba(248,113,113,.35)] bg-[rgba(248,113,113,.1)] px-4 py-3 text-sm text-[#fca5a5]">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Creating…" : "Open ticket"}
      </button>
    </form>
  );
}
