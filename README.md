# Thoth — AI Study Platform

Thoth (named for the ancient Egyptian god of wisdom and writing) is a full study
platform: summaries, quizzes, flashcards, a study plan, an AI mentor, progress
tracking, a Pomodoro timer, achievements, and a revision schedule.

Built with **Next.js 14** (App Router, TypeScript), **Tailwind CSS**,
**Supabase** (auth + Postgres database), and the **Anthropic API** (Claude)
for the AI-powered features.

**Visual identity:** two themes, toggled from the sidebar (or top bar on
mobile) — a dark mode (deep navy + gold, with a vertical gold Egyptian
embroidery motif) and a light mode (warm linen beige + black embroidery
motif). Preference is remembered per browser.

**Attachments:** the Summary, Quiz, and Mentor pages each have a "+" button
next to their text input. It accepts images (sent to Claude directly via
vision — great for photos of handwritten notes or textbook pages), plus
`.pdf`, `.docx`, `.txt`, and `.md` files (text is extracted client-side and
merged into the input).

## 1. Install dependencies

```bash
npm install
```

This also runs a `postinstall` step that copies the PDF.js worker file into
`public/` (needed for the PDF text-extraction attachment feature). If you
ever see a stale-worker issue, just re-run `npm install`.

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. Once created, open **SQL Editor** and run the entire contents of
   `lib/supabase/schema.sql`. This creates all tables and Row Level Security
   policies (each user can only see their own data).
3. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon / public key**
4. Go to **Authentication → Providers** and make sure **Email** is enabled.
   For local development, you may also want to turn off "Confirm email"
   under **Authentication → Settings** so you can sign up and log in
   immediately without checking an inbox.

## 3. Get an Anthropic API key

Create a key at [console.anthropic.com](https://console.anthropic.com) →
**API Keys**. This key is only ever used server-side (in `app/api/ai/*`
routes) — it is never exposed to the browser.

## 4. Configure environment variables

Copy the example file and fill in your real values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
ANTHROPIC_API_KEY=sk-ant-...
```

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign up for an account, and start studying.

## 6. Deploy

The easiest path is [Vercel](https://vercel.com):

1. Push this project to a GitHub repo.
2. Import it in Vercel.
3. Add the same three environment variables in the Vercel project settings.
4. Deploy.

## Project structure

```
app/
  page.tsx                 Landing page (Thoth hero image)
  login/, signup/          Auth pages
  dashboard/                Overview: streak, due revisions, recent scores
  summary/                  AI-generated study summaries
  quiz/                     AI-generated multiple-choice quizzes
  flashcards/               Decks + lightweight spaced-repetition review
  study-plan/                Subjects with checkable tasks
  mentor/                   Chat with Thoth (Claude), with saved history
  progress/                 Charts: quiz score trend, focus minutes
  pomodoro/                 Focus timer, logs sessions automatically
  achievements/              Cartouche badges unlocked by activity
  revision/                 Scheduled items with due dates
  api/ai/{summary,quiz,mentor}/route.ts   Server-side Claude calls
lib/
  supabase/{client,server,schema.sql}     Supabase setup
  anthropic.ts                             Shared Claude client + mentor prompt
components/
  AppShell.tsx          Sidebar navigation shell
  AuthForm.tsx          Shared login/signup form
  ProgressRing.tsx      Signature circular progress motif
  icons.tsx             Original Egyptian-motif icons (ankh, eye of Horus, etc.)
  ThemeProvider.tsx     Dark/light theme context (persisted to localStorage)
  ThemeToggle.tsx       The sun/moon toggle button
  AttachmentButton.tsx  The "+" button: images, PDF, DOCX, txt/md attachments
scripts/
  copy-pdf-worker.js    Postinstall step — copies the PDF.js worker to /public
middleware.ts           Refreshes Supabase session, protects private routes
```

## Notes for hackathon judges / TestSprite CLI

- All AI calls (`/api/ai/summary`, `/api/ai/quiz`, `/api/ai/mentor`) run
  server-side using the Anthropic API, so the API key is never exposed to
  the client.
- All data access goes through Supabase Row Level Security — every table
  policy restricts rows to `auth.uid() = user_id`, so one user can never
  read or write another user's data.
- `npm run build` succeeds; the only environment-specific requirement is
  reachable network access to `fonts.googleapis.com` (for `next/font`) and
  your Supabase project at build/runtime.
