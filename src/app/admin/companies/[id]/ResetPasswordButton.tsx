"use client";

import { useState, useTransition } from "react";
import { adminResetClientPasswordAction } from "@/app/admin/actions";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ password: string } | { error: string } | null>(null);

  function handleReset() {
    if (!confirm("Set a new temporary password for this client? Their current password will stop working.")) {
      return;
    }
    startTransition(async () => {
      const res = await adminResetClientPasswordAction(userId);
      setResult(res);
    });
  }

  if (result && "password" in result) {
    return (
      <div className="rounded-[var(--radius-s)] border border-[rgba(52,211,153,.3)] bg-[rgba(52,211,153,.1)] px-3 py-2 text-xs">
        <p className="mb-1 font-semibold text-[#6ee7b7]">New temporary password</p>
        <code className="text-[var(--text)]">{result.password}</code>
        <p className="mt-1 text-[var(--text-3)]">Copy this and share it with the client now — it won&apos;t be shown again.</p>
        <button type="button" onClick={() => setResult(null)} className="mt-2 text-[var(--text-3)] underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset} disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
      </button>
      {result && "error" in result && <p className="mt-1 text-xs text-[#fca5a5]">{result.error}</p>}
    </div>
  );
}
