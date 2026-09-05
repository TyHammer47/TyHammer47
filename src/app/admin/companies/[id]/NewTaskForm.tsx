"use client";

import { useActionState, useRef, useEffect } from "react";
import { createTaskAction } from "@/app/admin/actions";

export function NewTaskForm({ companyId }: { companyId: string }) {
  const [state, formAction, pending] = useActionState(createTaskAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-3">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="field flex-1">
        <input id="title" name="title" placeholder=" " required />
        <label htmlFor="title">Add a task…</label>
      </div>
      <input
        type="date"
        name="dueDate"
        aria-label="Due date"
        className="rounded-[var(--radius-s)] border-[1.5px] border-[var(--line)] bg-[var(--bg-2)] px-3 py-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--blue)]"
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        Add
      </button>
      {state.error && <p className="text-sm text-[#fca5a5]">{state.error}</p>}
    </form>
  );
}
