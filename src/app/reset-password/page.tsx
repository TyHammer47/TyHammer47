import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const tokenParam = params.token;
  const token = typeof tokenParam === "string" ? tokenParam : "";

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="panel px-7 py-8 sm:px-9 sm:py-10">
          <p className="mb-2 text-[.78rem] font-semibold uppercase tracking-[.18em] text-[var(--blue-light)]">
            Reset password
          </p>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  );
}
