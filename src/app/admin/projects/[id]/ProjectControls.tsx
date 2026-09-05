"use client";

import { useState, useTransition } from "react";
import { updateProjectStatusAction, updateProjectProgressAction } from "@/app/admin/actions";
import type { ProjectStatus } from "@/generated/prisma/enums";

export function ProjectControls({
  projectId,
  status,
  progressPercent,
}: {
  projectId: string;
  status: ProjectStatus;
  progressPercent: number;
}) {
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState(progressPercent);

  return (
    <div className="flex flex-col gap-5">
      <div className="field field-plain max-w-xs">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          defaultValue={status}
          disabled={pending}
          onChange={(e) =>
            startTransition(() => updateProjectStatusAction(projectId, e.target.value as ProjectStatus))
          }
        >
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="progress" className="text-xs font-semibold uppercase tracking-[.08em] text-[var(--text-3)]">
            Progress
          </label>
          <span className="serif-italic text-lg text-[var(--blue-light)]">{progress}%</span>
        </div>
        <input
          id="progress"
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          disabled={pending}
          onChange={(e) => setProgress(Number(e.target.value))}
          onPointerUp={(e) =>
            startTransition(() => updateProjectProgressAction(projectId, Number(e.currentTarget.value)))
          }
          onBlur={(e) => startTransition(() => updateProjectProgressAction(projectId, Number(e.currentTarget.value)))}
          className="w-full accent-[var(--blue)]"
        />
      </div>
    </div>
  );
}
