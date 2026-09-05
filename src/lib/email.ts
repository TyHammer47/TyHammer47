import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Hammer IT Solution <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email provider configured yet — log the link so the flow is still usable
    // during local development / before RESEND_API_KEY is set in production.
    console.log(`[password reset] RESEND_API_KEY not set. Reset link for ${to}:\n${resetUrl}`);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Hammer IT Solution password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>We received a request to reset the password for your Hammer IT Solution account.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">
            Reset password
          </a>
        </p>
        <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
