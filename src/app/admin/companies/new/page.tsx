"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCompanyAction } from "@/app/admin/actions";

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState(createCompanyAction, {});

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin" className="text-sm text-[var(--text-3)] hover:text-[var(--text)]">
        ← Back to companies
      </Link>
      <h1 className="serif-italic mt-3 mb-8 text-[2rem]">Add a new company</h1>

      <form action={formAction} className="panel flex flex-col gap-4 px-7 py-8">
        <div className="field">
          <input id="name" name="name" placeholder=" " required />
          <label htmlFor="name">Company name</label>
        </div>
        <div className="field">
          <input id="domain" name="domain" placeholder=" " />
          <label htmlFor="domain">Website / domain</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <input id="contactName" name="contactName" placeholder=" " />
            <label htmlFor="contactName">Contact name</label>
          </div>
          <div className="field">
            <input id="contactPhone" name="contactPhone" placeholder=" " />
            <label htmlFor="contactPhone">Contact phone</label>
          </div>
        </div>
        <div className="field">
          <input id="contactEmail" name="contactEmail" type="email" placeholder=" " />
          <label htmlFor="contactEmail">Contact email</label>
        </div>
        <div className="field">
          <textarea id="notes" name="notes" placeholder=" " />
          <label htmlFor="notes">Notes</label>
        </div>

        {state.error && (
          <p className="rounded-[var(--radius-s)] border border-[rgba(248,113,113,.35)] bg-[rgba(248,113,113,.1)] px-4 py-3 text-sm text-[#fca5a5]">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-2" disabled={pending}>
          {pending ? "Creating…" : "Create company"}
        </button>
      </form>
    </div>
  );
}
