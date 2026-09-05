"use client";

import { useActionState, useState } from "react";
import { createClientUserAction } from "@/app/admin/actions";

export function AddClientUserForm({ companyId }: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createClientUserAction, {});

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
        + Add client login
      </button>
    );
  }

  return (
    <form action={formAction} className="panel flex flex-col gap-3 px-5 py-5">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="field">
        <input id="clientName" name="name" placeholder=" " required />
        <label htmlFor="clientName">Contact name</label>
      </div>
      <div className="field">
        <input id="clientEmail" name="email" type="email" placeholder=" " required />
        <label htmlFor="clientEmail">Login email</label>
      </div>
      <div className="field">
        <input id="clientPassword" name="password" type="password" placeholder=" " required minLength={8} />
        <label htmlFor="clientPassword">Temporary password</label>
      </div>
      {state.error && <p className="text-sm text-[#fca5a5]">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Creating…" : "Create login"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
