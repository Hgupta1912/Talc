<div align="center">

# Curve

**A critique-first art platform. Artists share work, get real feedback, and use AI to see what it all adds up to.**

TechnicaHacka 2026 · [Live demo](#) talc-kbgh9y7l8-angelaliuusa-5592s-projects.vercel.app · [Frontend docs](frontend/README.md)

</div>

---

## Why Curve?

Most art apps are built around likes and scrolling. A heart tells an artist that someone liked their work, but not **why**, and not **what to do next**.

Curve puts **constructive feedback** at the center:

1. **Ask.** An artist uploads a piece and says exactly what they want feedback on, like *"Does the low angle distort his proportions?"*
2. **Critique.** Viewers find the piece in the feed and leave written critiques.
3. **Summarize.** Once a piece has 15 critiques, the artist can have **Gemini** turn them into a short summary: **strengths**, **what to improve**, and **concrete suggestions**.
4. **Discover.** The feed learns which mediums each viewer engages with, while still mixing in variety.

## Demo flow

> **Upload → Discover → Critique → Summarize**

1. Sign up and upload an artwork with a feedback question.
2. Log in as a second user, find the piece in the feed, and leave a critique.
3. Back as the artist, open the piece and click **Generate summary**.

## Features

| | Feature | Details |
| --- | --- | --- |
| 🔐 | **Accounts** | Sign up with username, email and password (with confirm-password and validation), JWT sessions that survive a refresh, change username and password |
| 🖼️ | **Discover feed** | Masonry grid with filters: For You, Recent, Most Discussed, and by medium (Digital, Painting, Drawing, 3D, Photography) |
| ⬆️ | **Uploads** | JPG, PNG or WebP up to 10 MB, with title, description, medium, genre (18 options) and a "what I want feedback on" prompt |
| 🔍 | **Artwork page** | Full-size image with a lightbox, artist info, the feedback prompt, and related work |
| 💬 | **Critiques** | Post, edit and delete. Up to 2,000 characters each and 50 per artwork. Commenters can edit their own; commenters **or** the artist can delete |
| ✨ | **AI critique summary** | Artist-only. Unlocks at 15 critiques. The artist chooses when to generate, show, hide or update it |
| 👤 | **Profiles** | Your own gallery with delete, and read-only public profiles at `/u/:username` |
| 🎯 | **Recommendations** | An epsilon-greedy bandit that learns which mediums each viewer engages with ([see below](#recommendation-engine)) |

## Tech stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · lucide-react icons |
| **Backend** | Node.js · Express 5 (CommonJS) |
| **Database** | PostgreSQL · Prisma 7 with `@prisma/adapter-pg` |
| **Auth** | JWT (Bearer tokens, 7-day expiry) · bcryptjs |
| **Images** | Multer (in-memory, 10 MB limit) → Cloudinary |
| **AI** | Google Gemini via `@google/genai` (structured JSON output) |

## Architecture

```text
┌──────────────────────────┐        /api/*        ┌──────────────────────────────┐
│  React + Vite (:5173)    │ ───────────────────▶ │  Express API (:3000)         │
│                          │   JSON / multipart   │                              │
│  pages → useApp() store  │   Bearer JWT         │  authenticate (JWT)          │
│  api/client.ts           │ ◀─────────────────── │  controllers → Prisma        │
│  api/mappers.ts          │                      │  multer → Cloudinary         │
└──────────────────────────┘                      │  lib/gemini → summaries      │
                                                  │  lib/recommender → feed      │
                                                  └──────────────┬───────────────┘
                                                                 ▼
                                                           PostgreSQL
```

- In development, **Vite proxies `/api` to the backend**, so the browser only ever talks to `localhost:5173`. No CORS setup is needed while developing.
- **Gemini and Cloudinary keys stay on the server.** The frontend never sees them.
- The frontend translates backend field names in one place, `src/api/mappers.ts` (for example `imageUrl` → `image`, `focus` → `feedbackOn`, `content` → `body`).

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL** (local or hosted)
- A **Cloudinary** account (needed for uploads)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey) (needed for summaries)

### 1. Clone

```bash
git clone https://github.com/Hgupta1912/Talc.git
cd Talc
```

### 2. Backend (`server/`)

```bash
cd server
npm install
```

Create `server/.env`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
JWT_SECRET=replace-with-a-long-random-string
FRONTEND_URL=http://localhost:5173
SERVER_PORT=3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=
# GEMINI_MODEL=   (optional, overrides the default model)
```

> If your Postgres password contains `@ : / # ?`, URL-encode them (for example `@` → `%40`).
> To make a JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Set up the database and start the server:

```bash
npx prisma migrate deploy   # create the tables
npx prisma generate         # build the Prisma client (in generated/, which is gitignored)
npm run dev                 # node --watch app.js → http://localhost:3000
```

### 3. Frontend (`frontend/`)

In a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # http://localhost:5173
```

`frontend/.env`:

```dotenv
BACKEND_URL=http://localhost:3000   # where Vite forwards /api
VITE_USE_POLLING=false              # true if hot reload misses saves in Docker
```

> There is **no `package.json` at the repo root**. Always run npm commands inside `server/` or `frontend/`.

### 4. (Optional) Demo data

To fill the feed with 60 public-domain works from the [National Gallery of Art open-access collection](https://www.nga.gov/artworks/free-images-and-open-access):

```bash
cd server
node scripts/seed-nga.js                     # add 60 artworks from 48 artists
node scripts/seed-comments.js "Your Title"   # add 15 sample critiques to one of your pieces
node scripts/seed-nga.js --remove            # remove all seeded data
```

### Staying up to date

```bash
git pull origin main
cd server   && npm install && npx prisma migrate deploy && npx prisma generate
cd ../frontend && npm install
```

Stop the backend (**Ctrl+C**) **before** running these. `node --watch` restarts whenever files in `node_modules/` or `generated/` change.

## API reference

**Base URL:** `http://localhost:3000/api`. Protected routes need `Authorization: Bearer <token>`.
Errors look like `{ "error": "message" }`. Deletes return `204 No Content`.

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/signup` | – | Register → `{ token, user }` |
| POST | `/auth/login` | – | Log in → `{ token, user }` |

</details>

<details>
<summary><strong>Users</strong></summary>

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/users/me` | ✅ | Your profile + artworks |
| PATCH | `/users/me` | ✅ | Change username |
| PATCH | `/users/me/password` | ✅ | Change password (rate-limited) |
| GET | `/users/:username` | – | Public profile + gallery |

</details>

<details>
<summary><strong>Artworks</strong></summary>

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks` | – | Feed (see [recommendations](#recommendation-engine)) |
| GET | `/artworks/:id` | – | One artwork + artist |
| POST | `/artworks` | ✅ | Upload (`multipart/form-data`: `image`, `title`, `description`, `medium`, `genre`, `focus`) |
| PATCH | `/artworks/:id` | Artist | Edit details |
| DELETE | `/artworks/:id` | Artist | Delete (comments and summary cascade) |

</details>

<details>
<summary><strong>Critiques</strong></summary>

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks/:artworkId/comments` | – | All critiques |
| POST | `/artworks/:artworkId/comments` | ✅ | Post (1–2,000 characters) |
| PATCH | `/artworks/:artworkId/comments/:commentId` | Commenter | Edit |
| DELETE | `/artworks/:artworkId/comments/:commentId` | Commenter or artist | Delete |

</details>

<details>
<summary><strong>AI critique summary</strong></summary>

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks/:artworkId/summary` | Artist | Saved summary (404 if none yet) |
| POST | `/artworks/:artworkId/summary` | Artist | Generate or regenerate (5 per 15 minutes) |

```json
{
  "strengths": ["The eye contact with the camera is the strongest element."],
  "improvements": ["The blown-out skylight pulls focus from the subject."],
  "suggestions": ["Shoot at eye level and crop out the ceiling light."],
  "commentCount": 15,
  "generatedAt": "2026-10-18T15:00:00.000Z"
}
```

</details>

## How the AI works

### Critique summaries

1. The server loads the artwork's title, description, medium, genre and **feedback focus**, plus its 50 most recent critiques.
2. It sends them to Gemini with a fixed JSON schema (`strengths`, `improvements`, `suggestions`), at a low temperature.
3. The instructions tell Gemini to:
   - base every point **only on the comments**, never claim to have seen the image, and never invent criticism
   - treat comment text **as data, not instructions**, which guards against prompt injection
   - pay attention to what the artist asked for feedback on
4. The result is validated and saved to `CritiqueSummary`. Regenerating replaces it.

On the frontend, only the artist sees the summary card. It shows a progress bar until there are 15 critiques, then a **Generate summary** button. An **Update** button appears once newer critiques have come in since the last summary.

### Recommendation engine

`server/lib/recommender.js` treats each **medium** as an arm of a multi-armed bandit:

- **Explore (30%):** pick a random medium, so the feed keeps variety.
- **Exploit (70%):** pick the medium with the best smoothed engagement rate, `(commented + 1) / (shown + 2)`.
- **Reward:** commenting on a recommended piece counts as engagement for that medium.
- Each user's stats are stored in `User.mediumEngagement` (JSON). The viewer's own work is excluded.

## Project structure

```text
Talc/
├── frontend/                 React + Vite client       → see frontend/README.md
│   └── src/
│       ├── api/              fetch wrapper + field mappers
│       ├── components/       grid, critiques, AI summary card, navbar, UI kit
│       ├── pages/            Discover, ArtworkDetail, Upload, Profile, Settings, Login
│       ├── store/            AppContext (all state + API actions), useApp hook
│       └── types/            API shapes vs UI shapes
└── server/                   Express API
    ├── controllers/          auth, users, artworks, comments, summaries
    ├── routes/               URL → controller mapping
    ├── middleware/           JWT auth, multer upload, error handler
    ├── lib/                  cloudinary, gemini, recommender
    ├── db/                   Prisma client + all queries
    ├── prisma/               schema.prisma + migrations
    └── scripts/              demo-data seeders
```

## Data model

```text
User 1 ──── * Artwork 1 ──── * Comment
  │                  │
  └──── * Comment    └──── 0..1 CritiqueSummary
```

| Model | Key fields |
| --- | --- |
| **User** | `id` (UUID), `username` (unique), `email` (unique), `password` (bcrypt hash), `mediumEngagement` (JSON), `createdAt` |
| **Artwork** | `id`, `title`, `description?`, `medium`, `genre`, `focus`, `imageUrl`, `imagePublicId?`, `artistId`, `createdAt` |
| **Comment** | `id`, `content`, `authorId`, `artworkId`, `createdAt` |
| **CritiqueSummary** | `id`, `artworkId` (unique), `strengths[]`, `improvements[]`, `suggestions[]`, `commentCount`, `generatedAt` |

Deleting an artwork **cascades** to its comments and summary.

## Security notes

- Passwords are hashed with bcrypt. JWTs expire after 7 days.
- An expired or invalid token logs the user out automatically on the frontend.
- Ownership is always checked on the server, from the JWT, never from IDs the client sends.
- Rate limits: 1,000 requests per 15 minutes per IP overall, plus tighter limits on password changes and AI summaries.
- Uploads are restricted to JPEG, PNG and WebP, 10 MB, one file per request.
- The JWT is kept in `localStorage` so sessions survive a refresh. Set `PERSIST_TOKEN = false` in `frontend/src/store/AppContext.tsx` to keep it in memory only.

## Known limitations

- **Recommendations aren't active yet.** `GET /artworks` doesn't use the `authenticate` middleware, and the frontend doesn't send a token for the feed, so everyone gets the anonymous feed (the 10 newest artworks).
- The 50-critique and 15-critique-for-summary limits are enforced in the **frontend only**.
- Deleting an artwork doesn't yet delete its image from Cloudinary.
- There's no pagination or infinite scroll. The feed is capped at 10.
- A saved summary can go stale as new critiques come in. The artist regenerates it with **Update**.
- There's no email verification, password reset or token revocation yet.

## Team

| Name | Role | Built |
| --- | --- | --- |
| **Hans Gupta** | Backend | Express API, Prisma schema and migrations, auth, Cloudinary uploads, Gemini summaries, recommender |
| **Angela Liu** | Frontend | UI design, React app, API integration, AI summary UI, demo-data seeding |

## Credits

- Demo artwork: [National Gallery of Art, Washington](https://www.nga.gov/artworks/free-images-and-open-access), open access
- Avatars: [DiceBear](https://www.dicebear.com) "Lorelei" (CC0)
- Icons: [Lucide](https://lucide.dev)
- Fonts: DM Sans and Manrope (Google Fonts)

## License

[MIT](LICENSE) © 2026 Hans Gupta and Angela Liu