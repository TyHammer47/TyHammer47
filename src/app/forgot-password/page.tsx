"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ActionState } from "./actions";

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="panel px-7 py-8 sm:px-9 sm:py-10">
          <p className="mb-2 text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
            Reset password
          </p>

          {state.success ? (
            <>
              <h1 className="serif-italic mb-4 text-[1.9rem]">Check your email</h1>
              <p className="text-sm text-[var(--text-2)]">
                If an account exists for that email address, we&apos;ve sent a link to reset your
                password. It expires in 1 hour.
              </p>
            </>
          ) : (
            <>
              <h1 className="serif-italic mb-6 text-[1.9rem]">Forgot your password?</h1>
              <p className="mb-6 text-sm text-[var(--text-2)]">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>

              <form action={formAction} className="flex flex-col gap-4">
                <div className="field">
                  <input id="email" name="email" type="email" placeholder=" " autoComplete="email" required />
                  <label htmlFor="email">Email address</label>
                </div>

                {state.error && (
                  <p className="rounded-[var(--radius-s)] border border-[rgba(248,113,113,.35)] bg-[rgba(248,113,113,.1)] px-4 py-3 text-sm text-[#fca5a5]">
                    {state.error}
                  </p>
                )}

                <button type="submit" className="btn btn-primary mt-2 w-full" disabled={pending}>
                  {pending ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-3)]">
          <Link href="/login" className="text-[var(--blue-light)] hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
