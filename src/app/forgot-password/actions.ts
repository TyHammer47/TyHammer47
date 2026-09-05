"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetToken, hashResetToken, PASSWORD_RESET_DURATION_SECONDS } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always behave the same whether or not the account exists, so this endpoint
  // can't be used to discover which emails have accounts.
  if (user) {
    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_DURATION_SECONDS * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return { success: true };
}
