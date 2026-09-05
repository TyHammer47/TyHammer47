"use client";

import { useActionState, useState } from "react";
import { createProjectAction } from "@/app/admin/actions";

export function NewProjectForm({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProjectAction, {});

  const [wasPending, setWasPending] = useState(pending);
  if (pending !== wasPending) {
    setWasPending(pending);
    if (wasPending && !pending && !state.error) {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        + New project
      </button>
    );
  }

  return (
    <form action={formAction} className="panel flex flex-col gap-3 px-5 py-5">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="field">
        <input id="projectName" name="name" placeholder=" " required />
        <label htmlFor="projectName">Project name</label>
      </div>
      <div className="field">
        <textarea id="projectDescription" name="description" placeholder=" " />
        <label htmlFor="projectDescription">Description</label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <input id="estimatedHours" name="estimatedHours" type="number" min="0" step="0.5" placeholder=" " />
          <label htmlFor="estimatedHours">Estimated hours</label>
        </div>
        <div className="field-plain">
          <label htmlFor="targetDate">Target date</label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            className="w-full rounded-[var(--radius-s)] border-[1.5px] border-[var(--line)] bg-[var(--bg-2)] px-3 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-[#fca5a5]">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
