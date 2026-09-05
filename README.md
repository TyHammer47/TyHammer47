# Hammer IT Solution — Ticketing & Task Tracker

A private ticketing system for Hammer IT Solution. Built to match the look and feel of the
main marketing site (dark theme, blue accents, serif-italic headings).

There are two sides to the app:

- **Engineer console** (`/admin`) — you sign in here. See every client company you support,
  their open/closed tickets, reply to tickets, run a per-client task tracker (a simple
  checklist for ongoing work), and track larger **projects** per client with a progress bar,
  an hours-logged-vs-estimated budget, and a weekly hours breakdown chart.
- **Client portal** (`/portal`) — a login you create for each client contact. They can only
  see their own company's tickets and projects (read-only progress + hours), open new tickets,
  and reply. They never see other companies or your internal task tracker.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL** via **Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **Auth**: email + bcrypt-hashed password, signed JWT session cookie (httpOnly). No third-party
  auth provider — accounts live entirely in your own database.
- **Tailwind CSS v4** for layout utilities, plus a small hand-written design system
  (`src/app/globals.css`) that mirrors the marketing site's tokens (colors, fonts, buttons, cards).

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — a Postgres connection string.
   - `SESSION_SECRET` — random string used to sign session cookies. Generate one with
     `openssl rand -base64 48`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — your own engineer login, created by the
     seed script below.
3. Create the database schema:
   ```bash
   npm run db:migrate
   ```
4. Create your engineer (admin) account:
   ```bash
   npm run db:seed
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
   Sign in at [http://localhost:3000/login](http://localhost:3000/login) with the
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set.

### Everyday workflow once it's running

- **Add a client**: Engineer console → *New company*. Fill in their name, website, and contact
  info.
- **Give a client portal access**: open that company → *Add client login* → set them an email
  and a temporary password. If they ever forget it, either they use *Forgot password?* on the
  sign-in page (self-service, emailed to them), or you click *Reset password* next to their
  name on the company page to issue a new temporary one instantly.
- **Log a ticket**: either you open one from the company page, or the client opens one from
  their portal. Either side can reply; you control status (Open → In Progress → Waiting on
  Client → Resolved/Closed) and priority from the ticket page.
- **Track ongoing work per client**: the *Task tracker* on each company page is a simple
  checklist only you see — for multi-step or recurring work that isn't tied to a single ticket.
- **Run a larger project for a client**: open that company → *New project*. Set a name,
  estimate, and target date. From the project page you control status and drag a progress
  slider, log hours as you work (with a note), and see a weekly hours chart and
  budget-vs-actual bar. The client sees a read-only version of the same page under *Projects*
  in their portal — good for status updates without a phone call.

## Database changes

This project uses Prisma migrations. After editing `prisma/schema.prisma`:

```bash
npm run db:migrate -- --name describe_your_change
```

In production, run `npm run db:deploy` instead (applies existing migrations without prompting
or generating new ones).

## Deploying

The app is a standard Next.js app — deploy it anywhere Next.js runs (Vercel is the path of
least resistance). Steps for Vercel:

1. **Push this repo to GitHub** (already done if you're reading this from the repo) and
   [import it into Vercel](https://vercel.com/new).
2. **Provision a Postgres database.** SQLite won't survive on serverless hosting — use a hosted
   Postgres instead. [Neon](https://neon.tech) and [Supabase](https://supabase.com) both have
   free tiers that work well with Vercel. Copy the connection string they give you.
3. **Set environment variables** in the Vercel project settings (Settings → Environment
   Variables): `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` (your production URL),
   and optionally `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` if you plan to re-run the seed
   script against production.
4. **Run migrations against the production database once**, from your machine, pointing
   `DATABASE_URL` at the production connection string:
   ```bash
   npm run db:deploy
   npm run db:seed
   ```
5. **Deploy.** Vercel runs `npm install` (which triggers `prisma generate` via the
   `postinstall` script) and then `npm run build` automatically.

### Pointing your own domain at it

Once you buy a domain for the ticketing system (e.g. `tickets.hammeritsolution.com` or a
standalone domain):

1. In the Vercel project, go to **Settings → Domains** and add the domain.
2. Vercel will show you a DNS record to add — either a `CNAME` (for a subdomain like
   `tickets.yourdomain.com`, pointing at `cname.vercel-dns.com`) or an `A` record (for a root
   domain).
3. Add that record with whoever you bought the domain through (GoDaddy, Namecheap, Google
   Domains, Cloudflare, etc). DNS changes can take a few minutes to a few hours to propagate.
4. Once it's verified, update `NEXT_PUBLIC_APP_URL` in Vercel's environment variables to the
   new domain and redeploy.

If you'd rather host this somewhere other than Vercel, any Node hosting that supports Next.js
(Railway, Render, Fly.io, your own VPS) works the same way — provision Postgres, set the same
environment variables, run `npm run build && npm run start`, and point DNS at whatever address
that host gives you.

### Turning on real "forgot password" emails

Without any email configured, a password reset link is logged to the server console instead of
emailed — fine for local development, not something you want in production. To send real emails:

1. Create a free [Resend](https://resend.com) account.
2. For quick testing, you can send from their shared `onboarding@resend.dev` address with no
   setup — that's the default in `.env.example`. To send from your own domain (e.g.
   `support@hammeritsolution.com`) once you own it, verify that domain in Resend's dashboard
   (a few DNS records, same place you'd add the Vercel domain records) and set `EMAIL_FROM`
   accordingly.
3. Copy your Resend API key into `RESEND_API_KEY` in your environment variables (locally in
   `.env`, in production in Vercel's project settings).

That's it — `src/lib/email.ts` picks it up automatically once the key is set.

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — never stored in plain text.
- Sessions are signed JWTs in an `httpOnly`, `sameSite=lax` cookie — not readable by
  client-side JavaScript.
- Clients can only ever read or write tickets and projects that belong to their own company;
  this is enforced on the server for every query, not just hidden in the UI.
- Password reset tokens are random 32-byte values, stored only as a SHA-256 hash (never the
  raw token), expire after 1 hour, and are single-use. The "forgot password" form always
  responds the same way whether or not the email has an account, so it can't be used to find
  out who has a login.
- Change `SESSION_SECRET` and the seeded admin password before you rely on this in production —
  the values in `.env.example` are placeholders only.

## Project structure

```
prisma/schema.prisma       Data model (User, Company, Ticket, TicketComment, Task, Project,
                            TimeEntry, PasswordResetToken)
prisma/seed.ts             Creates/updates the admin account from env vars
src/lib/auth.ts            Password hashing, session + reset-token signing/verification
src/lib/session.ts         Server-side helpers to read the current user (requireAdmin, etc)
src/lib/email.ts           Sends password-reset emails via Resend (or logs the link in dev)
src/lib/reports.ts         Groups logged hours by week for the project charts
src/proxy.ts               Route protection (Next.js "proxy", formerly middleware)
src/app/login/             Sign-in page + server action ("Forgot password?" links out)
src/app/forgot-password/   Request a reset link
src/app/reset-password/    Set a new password from a reset link
src/app/admin/             Engineer console (companies, tickets, task tracker, projects)
src/app/portal/            Client-facing portal (their tickets + read-only projects)
src/app/globals.css        Design tokens matching the marketing site
```
