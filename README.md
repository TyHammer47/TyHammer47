# Hammer IT Solution — Ticketing & Task Tracker

A private ticketing system for Hammer IT Solution. Built to match the look and feel of the
main marketing site (dark theme, blue accents, serif-italic headings).

There are two sides to the app:

- **Engineer console** (`/admin`) — you sign in here. See every client company you support,
  their open/closed tickets, reply to tickets, and run a per-client task tracker (a simple
  checklist for ongoing work — replacing a drive, a scheduled migration, etc).
- **Client portal** (`/portal`) — a login you create for each client contact. They can only
  see their own company's tickets, open new ones, and reply. They never see other companies
  or your internal task tracker.

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
  and a temporary password (tell them to note it down; there's no self-service password reset
  yet, so you'd update it by hand in the database or add a reset flow later if you want one).
- **Log a ticket**: either you open one from the company page, or the client opens one from
  their portal. Either side can reply; you control status (Open → In Progress → Waiting on
  Client → Resolved/Closed) and priority from the ticket page.
- **Track ongoing work per client**: the *Task tracker* on each company page is a simple
  checklist only you see — for multi-step or recurring work that isn't tied to a single ticket.

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

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — never stored in plain text.
- Sessions are signed JWTs in an `httpOnly`, `sameSite=lax` cookie — not readable by
  client-side JavaScript.
- Clients can only ever read or write tickets that belong to their own company; this is
  enforced on the server for every query, not just hidden in the UI.
- Change `SESSION_SECRET` and the seeded admin password before you rely on this in production —
  the values in `.env.example` are placeholders only.

## Project structure

```
prisma/schema.prisma       Data model (User, Company, Ticket, TicketComment, Task)
prisma/seed.ts             Creates/updates the admin account from env vars
src/lib/auth.ts            Password hashing + session cookie signing/verification
src/lib/session.ts         Server-side helpers to read the current user (requireAdmin, etc)
src/proxy.ts               Route protection (Next.js "proxy", formerly middleware)
src/app/login/             Sign-in page + server action
src/app/admin/             Engineer console (companies, tickets, task tracker)
src/app/portal/            Client-facing portal (their tickets only)
src/app/globals.css        Design tokens matching the marketing site
```
