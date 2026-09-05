"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTempPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import type { TicketStatus, TicketPriority, ProjectStatus } from "@/generated/prisma/enums";

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

export async function adminResetClientPasswordAction(
  userId: string,
): Promise<{ password: string } | { error: string }> {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT") {
    return { error: "Client account not found." };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  if (user.companyId) {
    revalidatePath(`/admin/companies/${user.companyId}`);
  }

  return { password: tempPassword };
}

const projectSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().trim().min(1, "Project name is required."),
  description: z.string().trim().nullable().optional(),
  estimatedHours: z.string().trim().nullable().optional(),
  startDate: z.string().trim().nullable().optional(),
  targetDate: z.string().trim().nullable().optional(),
});

export async function createProjectAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = projectSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    description: formData.get("description"),
    estimatedHours: formData.get("estimatedHours"),
    startDate: formData.get("startDate"),
    targetDate: formData.get("targetDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const estimatedHours = parsed.data.estimatedHours ? Number(parsed.data.estimatedHours) : null;
  if (estimatedHours !== null && (Number.isNaN(estimatedHours) || estimatedHours < 0)) {
    return { error: "Estimated hours must be a positive number." };
  }

  await prisma.project.create({
    data: {
      companyId: parsed.data.companyId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      estimatedHours,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
    },
  });

  revalidatePath(`/admin/companies/${parsed.data.companyId}`);
  return {};
}

export async function updateProjectStatusAction(projectId: string, status: ProjectStatus) {
  await requireAdmin();
  const project = await prisma.project.update({ where: { id: projectId }, data: { status } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/companies/${project.companyId}`);
}

export async function updateProjectProgressAction(projectId: string, progressPercent: number) {
  await requireAdmin();
  const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { progressPercent: clamped },
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/companies/${project.companyId}`);
}

export async function deleteProjectAction(projectId: string) {
  await requireAdmin();
  const project = await prisma.project.delete({ where: { id: projectId } });
  revalidatePath(`/admin/companies/${project.companyId}`);
  redirect(`/admin/companies/${project.companyId}`);
}

const timeEntrySchema = z.object({
  projectId: z.string().min(1),
  hours: z.string().trim().min(1, "Hours worked is required."),
  workDate: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export async function addTimeEntryAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = timeEntrySchema.safeParse({
    projectId: formData.get("projectId"),
    hours: formData.get("hours"),
    workDate: formData.get("workDate"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const hours = Number(parsed.data.hours);
  if (Number.isNaN(hours) || hours <= 0) {
    return { error: "Hours must be a positive number." };
  }

  await prisma.timeEntry.create({
    data: {
      projectId: parsed.data.projectId,
      hours,
      note: parsed.data.note || null,
      workDate: parsed.data.workDate ? new Date(parsed.data.workDate) : new Date(),
    },
  });

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  return {};
}

export async function deleteTimeEntryAction(timeEntryId: string) {
  await requireAdmin();
  const entry = await prisma.timeEntry.delete({ where: { id: timeEntryId } });
  revalidatePath(`/admin/projects/${entry.projectId}`);
}
