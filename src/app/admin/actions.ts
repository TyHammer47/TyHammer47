"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import type { TicketStatus, TicketPriority } from "@/generated/prisma/enums";

export type ActionState = { error?: string };

const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  domain: z.string().trim().optional(),
  contactName: z.string().trim().optional(),
  contactEmail: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  contactPhone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createCompanyAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const company = await prisma.company.create({
    data: {
      name: parsed.data.name,
      domain: parsed.data.domain || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      notes: parsed.data.notes || null,
    },
  });

  redirect(`/admin/companies/${company.id}`);
}

const clientUserSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function createClientUserAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = clientUserSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "CLIENT",
      companyId: parsed.data.companyId,
    },
  });

  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return {};
}

const ticketSchema = z.object({
  companyId: z.string().min(1),
  subject: z.string().trim().min(1, "Subject is required."),
  description: z.string().trim().min(1, "Description is required."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function createTicketAsAdminAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = ticketSchema.safeParse({
    companyId: formData.get("companyId"),
    subject: formData.get("subject"),
    description: formData.get("description"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.ticket.create({
    data: {
      companyId: parsed.data.companyId,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
      createdById: admin.id,
    },
  });

  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return {};
}

export async function updateTicketStatusAction(ticketId: string, status: TicketStatus) {
  await requireAdmin();
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/admin/companies/${ticket.companyId}`);
}

export async function updateTicketPriorityAction(ticketId: string, priority: TicketPriority) {
  await requireAdmin();
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { priority },
  });
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/admin/companies/${ticket.companyId}`);
}

const commentSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1, "Comment cannot be empty."),
});

export async function addAdminCommentAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = commentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.ticketComment.create({
    data: {
      ticketId: parsed.data.ticketId,
      authorId: admin.id,
      body: parsed.data.body,
    },
  });

  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`);
  return {};
}

const taskSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().trim().min(1, "Task title is required."),
  dueDate: z.string().trim().optional(),
});

export async function createTaskAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = taskSchema.safeParse({
    companyId: formData.get("companyId"),
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const count = await prisma.task.count({ where: { companyId: parsed.data.companyId } });

  await prisma.task.create({
    data: {
      companyId: parsed.data.companyId,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      position: count,
    },
  });

  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return {};
}

export async function toggleTaskAction(taskId: string, done: boolean) {
  await requireAdmin();
  const task = await prisma.task.update({ where: { id: taskId }, data: { done } });
  revalidatePath(`/admin/companies/${task.companyId}`);
}

export async function deleteTaskAction(taskId: string) {
  await requireAdmin();
  const task = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/admin/companies/${task.companyId}`);
}
