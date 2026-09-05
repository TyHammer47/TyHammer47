"use client";

import { useActionState, useRef, useEffect } from "react";
import { addClientCommentAction } from "@/app/portal/actions";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(addClientCommentAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="field">
        <textarea id="body" name="body" placeholder=" " required />
        <label htmlFor="body">Add a reply…</label>
      </div>
      {state.error && <p className="text-sm text-[#fca5a5]">{state.error}</p>}
      <button type="submit" className="btn btn-primary self-start" disabled={pending}>
        {pending ? "Posting…" : "Post reply"}
      </button>
    </form>
  );
}
