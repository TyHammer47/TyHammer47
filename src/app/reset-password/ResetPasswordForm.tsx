"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ActionState } from "./actions";

const initialState: ActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <>
        <h1 className="serif-italic mb-4 text-[1.9rem]">Password updated</h1>
        <p className="mb-6 text-sm text-[var(--text-2)]">
          Your password has been reset. You can sign in with it now.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Go to sign in
        </Link>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <h1 className="serif-italic mb-4 text-[1.9rem]">Invalid link</h1>
        <p className="mb-6 text-sm text-[var(--text-2)]">
          This reset link is missing its token. Request a new one from the sign-in page.
        </p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          Request a new link
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="serif-italic mb-6 text-[1.9rem]">Set a new password</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <div className="field">
          <input
            id="password"
            name="password"
            type="password"
            placeholder=" "
            autoComplete="new-password"
            minLength={8}
            required
          />
          <label htmlFor="password">New password</label>
        </div>
        <div className="field">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder=" "
            autoComplete="new-password"
            minLength={8}
            required
          />
          <label htmlFor="confirmPassword">Confirm new password</label>
        </div>

        {state.error && (
          <p className="rounded-[var(--radius-s)] border border-[rgba(248,113,113,.35)] bg-[rgba(248,113,113,.1)] px-4 py-3 text-sm text-[#fca5a5]">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-2 w-full" disabled={pending}>
          {pending ? "Saving…" : "Reset password"}
        </button>
      </form>
    </>
  );
}
