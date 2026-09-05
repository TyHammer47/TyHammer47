"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTimeEntryAction } from "@/app/admin/actions";

export function AddTimeEntryForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(addTimeEntryAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="field w-28">
        <input id="hours" name="hours" type="number" min="0.25" step="0.25" placeholder=" " required />
        <label htmlFor="hours">Hours</label>
      </div>
      <input
        type="date"
        name="workDate"
        defaultValue={today}
        aria-label="Date worked"
        className="rounded-[var(--radius-s)] border-[1.5px] border-[var(--line)] bg-[var(--bg-2)] px-3 py-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
      />
      <div className="field flex-1 min-w-[180px]">
        <input id="note" name="note" placeholder=" " />
        <label htmlFor="note">What did you work on?</label>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? "Logging…" : "Log time"}
      </button>
      {state.error && <p className="w-full text-sm text-[#fca5a5]">{state.error}</p>}
    </form>
  );
}
