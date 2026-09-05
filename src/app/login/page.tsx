"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-[13px]"
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                boxShadow: "0 6px 18px -4px rgba(59,130,246,.35), inset 0 1px 0 rgba(255,255,255,.3)",
              }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                <path d="M14.7 6.3a1 1 0 0 0-1.4 0L6.3 13.3a1 1 0 0 0 0 1.4l3 3a1 1 0 0 0 1.4 0l7-7a1 1 0 0 0 0-1.4l-3-3Z" />
                <path d="m17 6-1-1" />
                <path d="M9 8 3 14l3 3 6-6" />
              </svg>
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[1.02rem] font-bold text-[var(--text)]">Hammer IT Solution</span>
              <span className="block text-[.66rem] font-medium uppercase tracking-[.16em] text-[var(--text-3)]">
                Client Portal
              </span>
            </span>
          </Link>
        </div>

        <div className="panel px-7 py-8 sm:px-9 sm:py-10">
          <p className="eyebrow-row mb-2 text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
            Sign in
          </p>
          <h1 className="serif-italic mb-6 text-[1.9rem]">Welcome back</h1>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="field">
              <input id="email" name="email" type="email" placeholder=" " autoComplete="email" required />
              <label htmlFor="email">Email address</label>
            </div>
            <div className="field">
              <input
                id="password"
                name="password"
                type="password"
                placeholder=" "
                autoComplete="current-password"
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <Link
              href="/forgot-password"
              className="-mt-1 self-end text-sm text-[var(--text-3)] hover:text-[var(--blue-light)]"
            >
              Forgot password?
            </Link>

            {state.error && (
              <p className="rounded-[var(--radius-s)] border border-[rgba(248,113,113,.35)] bg-[rgba(248,113,113,.1)] px-4 py-3 text-sm text-[#fca5a5]">
                {state.error}
              </p>
            )}

            <button type="submit" className="btn btn-primary mt-2 w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-3)]">
          Don&rsquo;t have access yet? Ask your Hammer IT contact to set up your account.
        </p>
      </div>
    </main>
  );
}
