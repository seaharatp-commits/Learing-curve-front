# Learing-curve-front

Next.js frontend for **Learning Curve** — a Thai-language AI helpdesk/support web app.
Pages: Login, AI Chat, History, Report an Issue (แจ้งปัญหา), and an Admin area
(Knowledge Base management + Dashboard).

Companion repo: `Learing-curve-back` (NestJS + Prisma/Postgres, real backend — there is
no mock data left in this repo). Both repos live under `C:\Users\User\Desktop\LearningCurve\`.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- HeroUI **v2.8.10** — not v3. The house pattern skill this was scaffolded from pins v3,
  but v3 ships a completely different headless/slot-based component API (no `HeroUIProvider`,
  no `CardBody`, etc.) and its Tailwind v4 `@plugin` wiring doesn't work out of the box. v2's
  classic `Card`/`CardBody`, `Modal`/`ModalContent`, `Select`/`SelectItem` API is what every
  component in this repo actually uses — don't "fix" imports back to v3 names.
- Tailwind v4, registered via a local `heroui.plugin.ts` (`@plugin "../../heroui.plugin.ts"`
  in `src/app/globals.css`) since v2's `@heroui/theme` exports a named `heroui()` plugin
  function, not a default-exported one `@plugin` can load directly.
- TanStack React Query 5, NextAuth 4 (JWT session strategy), axios, dayjs, lucide-react

## Architecture

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (main)/{chat,history,report}/page.tsx   # session-guarded layout in (main)/layout.tsx
│   ├── (admin)/admin/{dashboard,knowledge-base}/page.tsx  # ADMIN-role-guarded layout
│   └── api/auth/[...nextauth]/route.ts          # the only API route left in this repo
├── components/
│   ├── ui/{Button,Input,Card}/Base*.tsx         # thin HeroUI wrappers
│   ├── layout/{MainLayout,AdminLayout}/
│   └── partials/{Login,Chat,History,Report,KnowledgeBase,Dashboard}/
├── hooks/{auth,chat,history,issue,knowledgeBase,dashboard,common}/   # React Query wrappers
├── services/*.service.ts        # business logic, talks to lib/api/api-main.ts
├── lib/api/{client.ts,api-main.ts}   # axios instance + raw endpoint functions
├── lib/auth/authOptions.ts      # NextAuth config
└── types/{api,app}/             # API DTOs vs. UI-facing types
```

Data flow: `lib/api/api-main.ts` (raw axios calls) → `services/*.service.ts` (mapping/business
logic) → `hooks/*/use*.ts` (React Query) → `components/partials/*/​*Content.tsx`.

### Auth

`NextAuth` (`src/lib/auth/authOptions.ts`) is a thin wrapper around the **real backend**:
`CredentialsProvider.authorize()` calls `POST {BACKEND_API_URL}/auth/login`, and the
returned JWT is stashed in the NextAuth session as `token.accessToken` / `session.accessToken`
(see `src/types/next-auth.d.ts` for the module augmentation). `src/lib/api/client.ts`'s axios
instance has a request interceptor that calls `getSession()` and attaches
`Authorization: Bearer <token>` to every outgoing request — so any new `services/*.service.ts`
call automatically gets authenticated for free, no manual header wiring needed.

Route protection is client-side, not middleware: `(main)/layout.tsx` and `(admin)/layout.tsx`
both check `useSession()` status and redirect to `/login` (or `/chat` if a non-admin hits the
admin group) in a `useEffect`.

### Backend integration

There used to be mock Next.js API routes (`/api/chat`, `/api/history`, `/api/issues`,
`/api/knowledge-base`) backed by an in-memory `src/lib/mock/db.ts`. **Both are gone.**
`lib/api/api-main.ts` now calls the real NestJS backend directly via `NEXT_PUBLIC_API_URL`/
`BACKEND_API_URL` (paths like `/chat`, `/history` — no `/api` prefix in the path itself,
since the backend's global prefix is already baked into the base URL).

If you're adding a new feature that needs a backend endpoint, add it to the **backend**
repo's `src/<feature>/` module, not as a Next.js route handler here.

### Demo accounts

Seeded in the backend (`prisma/seed.ts`): `admin@learningcurve.dev` / `admin1234` (ADMIN),
`user@learningcurve.dev` / `user1234` (USER).

## Local setup

```bash
npm install
cp .env.local.example .env.local   # if present — otherwise see below
npm run dev -- -p 3001
```

Required `.env.local` vars (must match wherever the backend is actually listening —
**check the backend's `.env` for its current `PORT`, it has drifted from the default before**):

```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3333/api
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

**This frontend cannot do anything useful on its own** — login, chat, history, issues, and
the admin pages all require:
1. The Postgres container running (`docker start learning-curve-db` if stopped)
2. The backend (`Learing-curve-back`) running and listening on the port `BACKEND_API_URL` points at

If login fails with "อีเมลหรือรหัสผ่านไม่ถูกต้อง" even with correct credentials, the most likely
cause is the backend or Postgres simply isn't running (or the port doesn't match) — not a
credentials bug.

## Known rough edges

- The chat UI's `ChatMessage.role` type is lowercase `"user" | "assistant"`, but the
  backend's Prisma enum is uppercase `USER`/`ASSISTANT`. `services/chat.service.ts`
  normalizes this on the way in — don't remove that without updating one side or the other.
- Occasional session bounce-back-to-login was observed during automated browser testing
  (Claude Code's preview tool) — unconfirmed whether it reproduces in a real browser for
  real users. Worth keeping an eye on if reported again.
- `KnowledgeBaseModal`'s form-reset effect must depend on `isOpen`, not just the `data` prop
  — see git history for why (it silently kept stale values across repeated opens otherwise).
