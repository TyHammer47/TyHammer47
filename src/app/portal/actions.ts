"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/session";

export type ActionState = { error?: string };

const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required."),
  description: z.string().trim().min(1, "Please describe the issue."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function createClientTicketAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireClient();

  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.ticket.create({
    data: {
      companyId: user.companyId!,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
      createdById: user.id,
    },
  });

  revalidatePath("/portal");
  return {};
}

const commentSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1, "Comment cannot be empty."),
});

export async function addClientCommentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireClient();

  const parsed = commentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket || ticket.companyId !== user.companyId) {
    return { error: "Ticket not found." };
  }

  await prisma.ticketComment.create({
    data: {
      ticketId: parsed.data.ticketId,
      authorId: user.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/portal/tickets/${parsed.data.ticketId}`);
  return {};
}
