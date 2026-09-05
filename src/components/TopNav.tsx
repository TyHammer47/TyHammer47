import Link from "next/link";
import { logoutAction } from "@/lib/logout-action";

export function TopNav({
  name,
  subtitle,
  links,
}: {
  name: string;
  subtitle: string;
  links: { href: string; label: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(8,8,8,.72)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
              boxShadow: "0 6px 18px -4px rgba(59,130,246,.35), inset 0 1px 0 rgba(255,255,255,.3)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
              <path d="M14.7 6.3a1 1 0 0 0-1.4 0L6.3 13.3a1 1 0 0 0 0 1.4l3 3a1 1 0 0 0 1.4 0l7-7a1 1 0 0 0 0-1.4l-3-3Z" />
              <path d="m17 6-1-1" />
              <path d="M9 8 3 14l3 3 6-6" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[.98rem] font-bold text-[var(--text)]">Hammer IT Solution</span>
            <span className="block text-[.62rem] font-medium uppercase tracking-[.16em] text-[var(--text-3)]">
              {subtitle}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--text-3)] sm:inline">{name}</span>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
