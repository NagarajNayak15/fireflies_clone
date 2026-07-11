# Fireflies Clone — Frontend

A Next.js (TypeScript, App Router) frontend for the Fireflies.ai clone backend.

It talks to the deployed backend at
`https://fireflies-clone-1.onrender.com` (FastAPI + SQLite).

## Features

- **Meetings dashboard** (`/meetings`): list, search, sort, filter, stats cards,
  "New Meeting" button, delete.
- **Meeting detail** (`/meetings/[id]`): audio player, interactive transcript
  with click-to-seek and active-line highlighting as the player plays,
  in-transcript search with next/prev jump, AI summary, action items (toggle
  complete), and topics/chapters.
- **Create Meeting modal**: upload a `.txt` transcript **or** paste transcript
  text (wrapped into a file client-side), plus a title.
- **Edit Meeting modal**: edit participants (functional). Title/date are shown
  read-only because the backend does not expose those endpoints yet.
- **Delete confirmation modal**.
- **Settings** (`/settings`) and **Analytics** (`/analytics`): "Coming soon"
  placeholders.
- **Toasts** for success/error feedback, and a cold-start loading message
  ("Waking up the server...") because the free-tier backend spins down when idle.

## Tech notes

- Plain Client Components (`"use client"`), `useEffect` + `fetch`, `useState`.
  No Server Actions, no API routes, no Redux.
- Tailwind CSS utility classes only. Toasts via `react-hot-toast`.
- All backend calls live in `lib/api.ts`. Types match the backend Pydantic
  models exactly in `lib/types.ts`.

## Setup

```bash
cd frontend
npm install
cp .env.local .env.local   # already present; NEXT_PUBLIC_API_URL is set
npm run dev
```

Then open http://localhost:3000 (redirects to `/meetings`).

### Environment variables

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | yes | `https://fireflies-clone-1.onrender.com` | Base URL of the backend API |

## Folder structure

```
frontend/
├─ app/
│  ├─ layout.tsx              # root layout: sidebar + navbar + toaster
│  ├─ globals.css             # tailwind directives
│  ├─ page.tsx                # redirects to /meetings
│  ├─ meetings/
│  │  ├─ page.tsx             # dashboard route (uses MeetingsDashboard)
│  │  └─ [id]/page.tsx        # meeting detail route
│  ├─ settings/page.tsx       # placeholder
│  └─ analytics/page.tsx      # placeholder
├─ components/
│  ├─ Sidebar.tsx
│  ├─ Navbar.tsx
│  ├─ LoadingState.tsx
│  ├─ Modal.tsx
│  ├─ MeetingsDashboard.tsx
│  ├─ MeetingDetail.tsx       # player + transcript sync + summary/actions/topics
│  ├─ CreateMeetingModal.tsx
│  ├─ EditMeetingModal.tsx
│  └─ DeleteModal.tsx
├─ lib/
│  ├─ api.ts                  # all backend calls
│  ├─ types.ts                # response type definitions
│  ├─ audio.ts                # generates a silent placeholder audio track
│  ├─ format.ts               # date/duration/timestamp formatting
│  └─ useDebounce.ts          # small debounce hook for search
├─ .env.local
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ next.config.mjs
├─ tsconfig.json
└─ package.json
```

## Known backend gaps (no endpoint exists — not faked)

These features are described in the spec but the backend does not provide an
endpoint, so the UI either shows them read-only or disables them:

1. **Edit meeting title / date** — backend only has
   `PUT /meetings/{id}/participants`. The edit modal shows title/date as
   read-only.
2. **Add / edit / delete action items** — backend only has
   `PATCH /action-items/{id}` to toggle `completed`. The detail page shows
   action items and lets you toggle them, but not add/edit/delete.
3. **Create meeting** only accepts `title` + a `.txt` upload (no date or
   participant fields, and no "paste text" field). Pasted text is wrapped into a
   `.txt` File client-side before upload.
4. **No media file** is stored by the backend, so the player uses a generated
   silent audio track (long enough for the transcript) to demo seek + sync.

If you want to enable any of these, add the corresponding endpoint to the
backend (e.g. `PUT /meetings/{id}` for title/date, `POST/PUT/DELETE
/action-items`, and a media upload field).
