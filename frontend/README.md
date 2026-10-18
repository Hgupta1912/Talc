# Curve: Frontend

The web client for **Curve**, an art critique platform. Artists post their work and say what they want feedback on, viewers leave written critiques, and artists can turn those critiques into an AI summary.

Built with **React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7**.

---

## Quick start

You need **Node 20+** and the [backend](../server) running on port `3000`.

```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

Open **http://localhost:5173**.

The frontend and backend run separately, so you need two terminals: one running `npm run dev` in `server/` and one in `frontend/`. There is no `package.json` at the repo root.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Environment variables

Set these in `frontend/.env` (copy from `.env.example`). Never commit `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | `http://localhost:3000` | Where Vite forwards `/api` requests. Use `http://backend:3000` when the backend runs in Docker. |
| `VITE_USE_POLLING` | `false` | Set to `true` if hot reload misses file saves inside Docker. |
| `VITE_API_URL` | `/api` | *(Optional)* Full API URL for production builds that aren't served behind the dev proxy. |

## How it talks to the backend

```
Browser ──/api/*──▶ Vite dev proxy ──▶ Express backend (localhost:3000) ──▶ Postgres
```

- **No CORS setup in dev.** The browser only talks to `localhost:5173`, and Vite proxies `/api` to the backend (see `vite.config.ts`).
- **Auth:** the JWT from `/api/auth/login` or `/api/auth/signup` is sent as `Authorization: Bearer <token>` and kept in `localStorage`, so a page refresh doesn't log you out. Set `PERSIST_TOKEN = false` in `src/store/AppContext.tsx` to keep it in memory only.
- **Expired or invalid token:** the backend returns `401`/`403`, and the app logs out and shows a toast.
- **Field names:** the backend and frontend use slightly different names (for example `imageUrl` → `image`, `focus` → `feedbackOn`, `content` → `body`). `src/api/mappers.ts` is the **only** place that translates between them. If the backend renames a field, change it there.

## Pages

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Discover | Masonry feed of all artwork, newest first, with medium filters |
| `/art/:id` | Artwork detail | Full image with a lightbox, artist info, critiques, and the artist's AI summary |
| `/upload` | Upload | Login required. JPG, PNG or WEBP, max 10 MB, with title, medium, genre and feedback focus |
| `/profile` | My profile | Your artwork, with delete |
| `/u/:username` | Artist profile | Someone else's artwork, read-only |
| `/settings` | Settings | Change your username |
| `/login`, `/signup` | Auth | Signup validates username, password length, and confirm password |

## Feature rules

- **Critiques:** max 2,000 characters each and **50 per artwork**. After that, the comment box closes.
- **Editing:** only the author can edit a critique. The author **or** the artist can delete it.
- **Deleting artwork** also removes its critiques. Only the artist can do it.
- **AI critique summary:** only the artist sees it. It unlocks at **15 critiques**, and the artist chooses whether to generate it, then can show, hide, or update it. Generation is done by the backend through Gemini.

## Project structure

```
src/
├── api/
│   ├── client.ts        # fetch wrapper: base URL, auth header, JSON/FormData, errors
│   └── mappers.ts       # backend ⇄ frontend field translation
├── components/
│   ├── ArtworkGrid.tsx  # masonry grid, cards, loading skeletons
│   ├── Critiques.tsx    # critique list, post / edit / delete
│   ├── CritiqueSummary.tsx # AI summary card (artist only)
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   └── ui.tsx           # Avatar, KebabMenu, ConfirmDialog, EmptyState, Toaster…
├── data/
│   └── constants.ts     # MEDIUMS and GENRES lists
├── pages/               # one file per route (see table above)
├── store/
│   ├── context.ts       # AppState type + React context
│   ├── AppContext.tsx   # <AppProvider>: all state and API actions
│   └── useApp.ts        # useApp() hook
├── types/
│   ├── api.ts           # shapes the backend returns
│   └── canvas.ts        # shapes the UI uses
├── utils/
│   ├── avatar.ts        # avatar URL from username
│   └── time.ts          # "3h ago" formatting
├── App.tsx              # routes
├── main.tsx             # entry point
└── index.css            # Tailwind theme + shared classes
```

### State

All shared data (current user, artwork, critiques, toasts) lives in one React context. Components read it with `useApp()`:

```tsx
const { currentUser, artworks, addComment } = useApp()
```

Every action that calls the backend is defined in `AppContext.tsx`. When a request fails, the action shows a toast and returns `false` (or `null`) instead of throwing, so pages can just check the result.

## Design

- **Colors** are Tailwind theme tokens in `src/index.css` (`@theme`): blush background, forest-green accent (`#1f6b45`), dark-orange (rust) labels. Use them as classes like `bg-blush`, `text-accent` or `text-rust`.
- **Shared classes:** `.btn-primary`, `.btn-secondary`, `.field`, `.eyebrow`, `.headline`, `.skeleton`.
- **Fonts:** DM Sans (body) and Manrope (headings), from Google Fonts.
- **Icons:** [lucide-react](https://lucide.dev).
- **Avatars:** generated from the username with [DiceBear](https://www.dicebear.com) "Lorelei" (CC0 license).

## Code style

Prettier (`.prettierrc`): tabs, single quotes, no semicolons. TypeScript runs in strict mode with `verbatimModuleSyntax`, so type-only imports must use `import type { … }`.

## Docker

```bash
docker build -t talc-frontend .
docker run -p 5173:5173 --env BACKEND_URL=http://backend:3000 talc-frontend
```

When running in Docker, set `VITE_USE_POLLING=true` if hot reload stops picking up changes.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm run dev` → `ENOENT package.json` | You're in the repo root. `cd frontend` first. |
| Toast: *"Could not reach the server"*, or Vite logs `ECONNREFUSED` | The backend isn't running. Start it in `server/`. |
| Vite logs `ECONNRESET` | The backend crashed or restarted mid-request. Check the server terminal. |
| Blank page | Open DevTools → Console for the error. |
| Logged in but everything 403s | Your saved token is stale. Log out and back in. |