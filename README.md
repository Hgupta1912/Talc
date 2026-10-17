# __________

**An art-sharing and critique platform that helps artists receive useful feedback.**

A mobile-first web app inspired by Pinterest and TikTok: artists share work, viewers discover new artwork and leave critiques, and artists can use Gemini AI to turn scattered comments into a concise, actionable feedback summary.

**Hackathon:** TechnicaHacka 2026  
**Team:** Hans Gupta (backend) · Angela Liu (frontend)  
**Demo:** __________  

## Screenshots / Demo

<!-- Add screenshots, a demo GIF, or a short video once the frontend is ready. -->

| Feed | Artwork detail + comments | AI critique summary |
| --- | --- | --- |
| __________ | __________ | __________ |

## The idea

Traditional art-sharing feeds emphasize posting, liking, and scrolling. This project puts **constructive feedback** at the center:

1. An artist uploads an artwork and indicates what kind of feedback they want (for example, composition or lighting).
2. Viewers browse artworks and leave written critiques.
3. The artist could then ask Gemini to summarize the feedback into **strengths**, **areas for improvement**, and **actionable suggestions**.
4. In a future version, personalized recommendations could surface artworks a viewer is likely to engage with while maintaining variety in the feed.

### MVP feature scope

| Feature | Description |
| --- | --- | 
| Accounts | Sign up and log in with email, username, and password |
| User profiles | View your own profile/artworks or browse another artist's profile |
| Artwork feed | Browse artwork posts, newest first | 
| Artwork uploads | Upload an image with title, description, medium, generation method, and critique focus | 
| Artwork details | View a post, its artist, and its critiques | 
| Comments | Read, create, edit, and delete critiques with ownership rules | 
| AI summaries | Generate and retrieve structured summaries of an artwork's comments | 

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | **React** · build tooling: __________ · language: __________ · styling: __________ |
| Backend | **Node.js + Express**, JavaScript (CommonJS) |
| Database | **PostgreSQL** |
| ORM | **Prisma** (PostgreSQL driver adapter through `@prisma/adapter-pg`) |
| Authentication | **JSON Web Tokens (JWT)**, Bearer-token authorization, `bcryptjs` password hashing |
| Image uploads | **Multer** (memory storage, intended 10 MB file limit) |
| Image hosting | **Cloudinary** |
| AI summaries | **Google Gemini API** via `@google/genai` |
| Frontend hosting | __________ |
| Backend hosting | __________ |
| Database hosting | __________ |

### Architecture

```text
React web app
   |  HTTPS / REST (JSON; multipart/form-data for uploads)
   v
Node.js + Express API
   |-- JWT middleware -> authenticated user ID
   |-- Controllers -> Prisma queries -> PostgreSQL
   |-- Multer -> Cloudinary (artwork image hosting)
   `-- Gemini API -> generated critique summaries -> PostgreSQL
```

The frontend handles page rendering, forms, and displaying results. The backend validates requests, enforces ownership, stores records, uploads images, and calls Gemini. **Gemini and Cloudinary credentials stay on the server.**

## Data model

The main Prisma models are:

- **User** — `id`, `username`, `email`, account creation date, artworks; authentication password hash field: __________ (must match backend auth code).
- **Artwork** — `id`, `title`, optional `description`, `medium`, `generated`, `focus`, `imageUrl`, `artistId`, `createdAt`.
- **Comment** — `id`, `content`, `authorId`, `artworkId`, `createdAt`.
- **CritiqueSummary** — `id`, `artworkId` (unique), string arrays `strengths`, `improvements`, `suggestions`, `commentCount`, `generatedAt`.

Relationships:

```text
User 1 ---- * Artwork
User 1 ---- * Comment
Artwork 1 - * Comment
Artwork 1 - 0..1 CritiqueSummary
```

All IDs are UUID **strings**. The `generated`, `medium`, and `focus` fields are currently strings, not enums or booleans. `imageUrl` refers to an image stored on Cloudinary, not image bytes stored in PostgreSQL.

## API overview

**Local base URL:** `http://localhost:3000/api` (or the port set by `SERVER_PORT`).  
**Authentication header:** `Authorization: Bearer <JWT>` for protected endpoints.  
**Response convention:** API routes generally return JSON objects or arrays directly. Errors use `{ "error": "..." }`. Deletions return `204 No Content`.

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Register; returns `{ token, user }` |
| POST | `/auth/login` | No | Log in; returns `{ token, user }` |

### Users

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/users/me` | Yes | Current user's profile and artworks |
| PATCH | `/users/me` | Yes | Update username and/or email |
| GET | `/users/:username` | No | Public profile and artwork gallery |

### Artworks

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks` | No | Feed of recent artworks |
| GET | `/artworks/:id` | No | Artwork details and artist information |
| POST | `/artworks` | Yes | Create artwork with image upload |
| PATCH | `/artworks/:id` | Artist only | Update artwork metadata |
| DELETE | `/artworks/:id` | Artist only | Delete artwork |

### Comments (nested under artworks)

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks/:artworkId/comments` | No | Read all comments on an artwork |
| POST | `/artworks/:artworkId/comments` | Yes | Write a comment |
| PATCH | `/artworks/:artworkId/comments/:commentId` | Commenter only | Edit own comment |
| DELETE | `/artworks/:artworkId/comments/:commentId` | Commenter **or** artist | Remove a comment |

### AI critique summaries (Gemini)

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/artworks/:artworkId/summary` | Artist only | Read the most recently saved summary |
| POST | `/artworks/:artworkId/summary` | Artist only | Call Gemini, save, and return a new summary |

> These summary routes are part of the planned Gemini integration. Confirm that they are mounted and tested before listing them as live in a deployed demo.

**Example AI summary response** (illustrative):

```json
{
  "id": "summary-uuid",
  "artworkId": "artwork-uuid",
  "strengths": ["Viewers liked the warm colors and sense of depth."],
  "improvements": ["Several comments said the focal point was unclear."],
  "suggestions": ["Try increasing contrast around the main subject."],
  "commentCount": 6,
  "generatedAt": "2026-10-17T20:00:00.000Z"
}
```

For the full request/response details and frontend integration examples, see [FRONTEND_API_README.md](./FRONTEND_API_README.md) **if that file is included in the repository**.

## Running locally

### Prerequisites

- Node.js **20+** (for the Gemini SDK), npm
- PostgreSQL or a hosted PostgreSQL database
- Cloudinary account
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Git

### 1. Clone the project

```bash
git clone __________
cd __________
```

The commands below assume `frontend/` and `backend/` directories. **Adjust these paths to match the actual repository structure.**

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env` with:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="REPLACE_WITH_A_LONG_RANDOM_SECRET"
FRONTEND_URL="http://localhost:5173"
SERVER_PORT=3000

CLOUDINARY_CLOUD_NAME="__________"
CLOUDINARY_API_KEY="__________"
CLOUDINARY_API_SECRET="__________"

GEMINI_API_KEY="__________"
GEMINI_MODEL="__________"
```

Generate a suitable JWT secret, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Configure `DATABASE_URL` in the project's Prisma configuration (Prisma 7) and use **a separate database from Hiemetry**.

Apply the project's migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend using the script in `backend/package.json`:

```bash
npm run __________
```

Expected local server URL: `http://localhost:3000`, unless configured otherwise.

### 3. Configure the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run __________
```

Frontend environment variables, if required:

```dotenv
# Exact name depends on the frontend setup:
VITE_API_URL="http://localhost:3000/api"
```

Expected frontend local URL: `http://localhost:5173` **if using Vite**; otherwise __________.

### 4. Verify the application

1. Register or log in.
2. Upload a painting or other artwork (JPEG, PNG, or WebP, up to the configured limit).
3. Confirm it appears in the feed and on the artist's profile.
4. Log in as a second user and leave a critique.
5. Return to the original artist's account and generate the Gemini critique summary.

## Integration examples

### Authenticated JSON request

```js
const response = await fetch('http://localhost:3000/api/users/me', {
  headers: { Authorization: `Bearer ${token}` },
});
const user = await response.json();
```

### Upload an artwork

```js
const form = new FormData();
form.append('image', selectedFile);
form.append('title', title);
form.append('description', description);
form.append('medium', medium);
form.append('generated', generated);
form.append('focus', focus);

const response = await fetch('http://localhost:3000/api/artworks', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
```

**Do not manually add a `Content-Type` header when sending `FormData`**; the browser sets the multipart boundary. Do not send `artistId` or `authorId` from the client: the backend obtains those from the authenticated JWT.

### Generate a critique summary

```js
const response = await fetch(
  `http://localhost:3000/api/artworks/${artworkId}/summary`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }
);
const summary = await response.json();
```

The frontend should show a loading state while Gemini generates the response.

## AI approach

**Critique summarization:** The server retrieves comments associated with an artwork and sends the comment text plus relevant artwork metadata to Gemini. It asks for structured JSON containing `strengths`, `improvements`, and `suggestions`, then stores the result in `CritiqueSummary` through Prisma. The MVP does **not** require RAG, embeddings, or an AI agent. Summary conclusions should reflect the actual comments rather than invented observations about the image.

**Future artwork recommendations:** A potential enhancement is an online-learning or contextual-bandit recommender that adapts to user interests and comment engagement, while encouraging diversity. An embedding-based per-user Q-table is a research/stretch idea, **not a prerequisite for the hackathon demo**.

## Current MVP constraints and follow-ups

- The feed design uses newest-first ranking; pagination, advanced discovery, and learned recommendation ranking are not yet specified.
- The initial summary design considers up to 50 recent comments and replaces the stored summary on a new generation request. A saved summary may become stale after comments change unless regenerated.
- Artwork image replacement is not currently part of the PATCH endpoint.
- Cloudinary cleanup on artwork deletion requires tracking the image's `public_id` (or implementing another reliable cleanup mechanism); verify before enabling deletion widely.
- Ensure database cascade rules handle dependent comments/summaries if artwork deletion is enabled.
- Confirm that the Prisma `User` password field matches what the reused auth controller reads and writes; the original Hiemetry controller expects `password`.
- JWT logout/revocation, robust upload-content verification, and stronger authentication protections are future production-hardening tasks.
- Frontend responsiveness, accessibility, final UI design, and deployment details: __________.

## Team contributions

| Area | Contributor | Notes |
| --- | --- | --- |
| Backend API / database / integrations | __________ | Express, Prisma, PostgreSQL, Multer, Cloudinary, Gemini |
| Frontend UI / API integration | __________ | React and __________ |
| Design / product decisions | __________ | __________ |

## Hackathon demo flow

**Upload → Discover → Critique → Summarize.** One user uploads an artwork and states what they want feedback on. Another user opens it from the feed and comments. The original artist then generates an AI summary to see the main strengths, weaknesses, and suggested next steps.

## License

__________
