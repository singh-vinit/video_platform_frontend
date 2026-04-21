# Creator-Consumer Video Platform — Frontend

A full-stack Next.js frontend for a creator-consumer video platform. Creators upload and manage videos via a dashboard. End users discover creators, subscribe, watch videos, and interact via live comments powered by Socket.IO.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Pages and Routes](#pages-and-routes)
- [Component Overview](#component-overview)
- [Tech Decisions](#tech-decisions)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer | Technology |

|---|---|

| Framework | Next.js 15 (App Router) |

| Language | TypeScript |

| Styling | Tailwind CSS v4 |

| Component Library | shadcn/ui |

| Real-time | Socket.IO Client |

| File Storage | Supabase Storage (direct browser upload) |

| HTTP Client | Axios |

| Auth | JWT stored in localStorage |

| Fonts | Syne (headings) + Epilogue (body) |

| Containerization | Docker (standalone build) |

---

## Project Structure

```

src/

├── app/

│   ├── (auth)/

│   │   ├── login/page.tsx          # Login page

│   │   └── signup/page.tsx         # Signup with role selection

│   ├── (main)/

│   │   ├── layout.tsx              # Shared layout with Navbar

│   │   ├── dashboard/page.tsx      # Creator — upload + manage videos

│   │   ├── feed/page.tsx           # User — discover creators + video feed

│   │   ├── creator/[id]/page.tsx   # Creator profile + subscribe

│   │   └── video/[id]/page.tsx     # Video player + live comments

│   ├── layout.tsx                  # Root layout — fonts, AuthProvider, Toaster

│   └── page.tsx                    # Root redirect based on role

├── components/

│   ├── Navbar.tsx                  # Sticky top nav with role-aware links

│   ├── VideoCard.tsx               # Video thumbnail card with link

│   ├── CreatorCard.tsx             # Creator avatar card with link

│   ├── CommentSection.tsx          # Socket.IO live comment feed + input

│   ├── UploadVideoModal.tsx        # Upload to Supabase + save metadata

│   ├── EditVideoModal.tsx          # Edit title/description (file unchanged)

│   └── DeleteVideoModal.tsx        # Confirm before deleting video

├── context/

│   └── AuthContext.tsx             # Global auth state — user, token, login, logout

├── lib/

│   ├── api.ts                      # Axios instance with JWT interceptor

│   ├── supabase.ts                 # Supabase client (anon key, browser only)

│   └── socket.ts                   # Socket.IO singleton with lazy connect

└── types/

    └── index.ts                    # Shared TypeScript interfaces

```

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- A running instance of the backend server
- A [Supabase](https://supabase.com) project with a storage bucket named `videos` set to **public**
- npm or yarn

### 1. Clone and install

```bash

git clone <your-repo-url>

npm install

```

### 2. Configure environment variables

```bash

cp .env.example .env.local

```

Fill in your values — see [Environment Variables](#environment-variables) below.

### 3. Start the development server

```bash

npm run dev

```

App runs at `http://localhost:3000`

---

### Supabase Storage Setup

Before uploading videos, configure Supabase Storage:

1. Go to **Supabase Dashboard → Storage → New Bucket**
2. Name it `creator_videos`, enable **Public bucket**
3. Go to **Storage → Policies** and add an upload policy:

```sql

CREATE POLICY "Allow public uploads"

ON storage.objects FORINSERT

TO anon

WITHCHECK(bucket_id ='creator_videos');

```

---

### Running with Docker

**Build the image** — pass all `NEXT_PUBLIC_` variables as build arguments since they are baked in at build time:

**warning** - I included my .env.local file during build image instead of build args so you can decide according to it. add .env.local in your .dockerignore for build args without it just remove .env.local from your .dockerignore file.

```bash

docker build -t video-frontend .

```

**Run the container:**

```bash

docker run -p 3000:3000 video-frontend

```

---

### Available Scripts

| Script | Description |

|---|---|

|`npm run dev`| Start dev server with hot reload |

|`npm run build`| Build for production (standalone output) |

|`npm start`| Start production server (after build) |

|`npm run lint`| Run ESLint |

---

## Environment Variables

Create a `.env.local` file in the root. All variables must be prefixed with `NEXT_PUBLIC_` because they are used in the browser.

```env

# Backend API base URL

NEXT_PUBLIC_API_URL=http://localhost:5000/api


# Backend Socket.IO URL (no /api suffix)

NEXT_PUBLIC_SOCKET_URL=http://localhost:5000


# Supabase project URL — from Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co


# Supabase anon key — from Project Settings → API

# This is the PUBLIC key, safe to expose in the browser

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


# Name of your Supabase Storage bucket

NEXT_PUBLIC_SUPABASE_BUCKET=videos

```

> **Important:** These variables are baked into the JavaScript bundle at build time by Next.js. If you change them, you must rebuild the app. When using Docker, pass them as `--build-arg` flags — see [Running with Docker](#running-with-docker).

---

## Pages and Routes

| Route | Access | Role | Description |

|---|---|---|---|

|`/`| Public | Any | Redirects to `/dashboard` (CREATOR) or `/feed` (USER) |

|`/login`| Public | Any | Email + password login |

|`/signup`| Public | Any | Register with role toggle (Viewer / Creator) |

|`/dashboard`| Protected | CREATOR | Upload videos, edit metadata, delete videos |

|`/feed`| Protected | USER | Discover all creators, view subscribed + other videos |

|`/creator/[id]`| Protected | USER | Creator profile, their videos, subscribe/unsubscribe |

|`/video/[id]`| Protected | Any | Video player, video details, live comment section |

### Route protection

There is no middleware-based route guard. Each protected page checks `user.role` inside a `useEffect` and calls `router.replace()` if the role doesn't match. The Axios interceptor handles expired or missing tokens by redirecting to `/login` on any 401 response.

---

## Component Overview

### `AuthContext`

Stores `user` and `token` in React state, synced to `localStorage` on login and cleared on logout. Wraps the entire app in `layout.tsx`. All pages read auth state from here via the `useAuth()` hook.

### `api.ts` (Axios instance)

Two interceptors are configured. The request interceptor reads the JWT from `localStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request. The response interceptor catches 401 responses, clears localStorage, and redirects to `/login` automatically — so no page needs to handle auth expiry manually.

### `socket.ts` (Socket.IO singleton)

The socket instance is created once and reused across the app. It is initialized with `autoConnect: false` so it only connects when a video page mounts. The JWT is passed in `auth: { token }` at connection time, which the backend's Socket.IO middleware verifies before accepting the connection.

### `CommentSection`

Connects to Socket.IO on mount, joins the video room with `join_video`, listens for `new_comment` broadcasts, and emits `send_comment` on input submit. Shows a live indicator dot (green when connected, red on error). On unmount it emits `leave_video` and disconnects cleanly.

### `UploadVideoModal`

Uploads the video file directly from the browser to Supabase Storage using the Supabase JS client. Once the upload completes, it calls `getPublicUrl()` to get the CDN URL, then sends a lightweight `POST /api/videos` request to the backend with `{ title, description, url }`. The backend never touches the file.

### `EditVideoModal`

Pre-fills title and description from the selected video. Sends a `PATCH /api/videos/:id` request with only the updated metadata. The Supabase file URL is never sent or modified.

### `DeleteVideoModal`

Shows the video title and a confirmation message before deleting. Sends `DELETE /api/videos/:id` — the backend handles removing both the database record and the Supabase Storage file.

---

## Tech Decisions

### Why Next.js App Router over Pages Router?

The App Router supports React Server Components, nested layouts, and colocated loading/error states. The `(auth)` and `(main)` route groups allow a shared Navbar layout for authenticated pages without affecting the auth pages. While this project doesn't use Server Components heavily (most pages are client components due to auth state), the App Router structure scales better as the project grows.

### Why shadcn/ui over a full component library like MUI or Chakra?

shadcn/ui components are copied directly into the project — they are not installed as a black-box dependency. This means full control over styling and behaviour without fighting the library's opinions. Every component is standard Tailwind CSS so the design stays consistent with the rest of the app. MUI and Chakra bring significant bundle size and their own styling systems which conflict with Tailwind.

### Why Tailwind CSS v4?

Tailwind v4 moves to a CSS-first configuration — no `tailwind.config.js` needed. The `@import "tailwindcss"` in `globals.css` is enough. It is significantly faster than v3 and produces smaller output due to improved tree-shaking. CSS variables defined in the theme integrate directly with shadcn/ui's variable-based tokens.

### Why Axios over fetch?

Axios interceptors handle the JWT attachment and 401 redirect globally in one place. With native `fetch` you would need to wrap it in a custom function or repeat the Authorization header and error handling on every call. Axios also automatically parses JSON responses and provides cleaner error objects with `error.response.data`.

### Why direct Supabase upload from the browser?

Routing video files through the backend adds unnecessary load on the Node.js server. Large files would consume memory, block the event loop during I/O, and slow uploads because the file travels to the server before reaching storage. Direct browser-to-Supabase upload means the file goes straight to the CDN-backed bucket. The backend only receives a small JSON payload with the public URL.

### Why store JWT in localStorage over cookies?

For a demo project localStorage is simpler — no cookie configuration, no CSRF concerns to manage, and it works identically across different frontend deployment origins. The tradeoff is that localStorage is accessible to JavaScript (XSS risk). A production implementation would use `httpOnly` cookies set by the backend, which are invisible to JavaScript and provide stronger security guarantees.

### Why Socket.IO over native WebSocket?

Socket.IO provides automatic fallback to HTTP long-polling when WebSocket connections are blocked by firewalls or proxies. It also handles automatic reconnection when the connection drops, built-in room management (one room per video), and an auth middleware pattern for JWT verification on connect. All of this would need to be manually implemented with native WebSocket.

### Why standalone output for Docker?

Next.js standalone mode statically traces all imports at build time and copies only the required `node_modules` into `.next/standalone/`. The result is a self-contained `server.js` that runs with just `node server.js` — no `npm start`, no full `node_modules` directory, no Next.js package required at runtime. This reduces the final Docker image from ~400MB to ~100-150MB and improves container startup time.

---

## Known Limitations

### Authentication

- **JWT stored in localStorage.** Accessible to JavaScript, which makes it vulnerable to XSS attacks. A production implementation would store tokens in `httpOnly` cookies set by the backend.
- **No token refresh.** When the 7-day token expires the user is silently redirected to login. There is no silent refresh or remember-me flow.
- **No route guard middleware.** Protected pages use `useEffect` + `router.replace()` for role checks. There is a brief render flash before the redirect fires. Next.js middleware (`middleware.ts`) should be used in production to protect routes at the edge before the page renders.

### Video Upload

- **No file type validation before upload.** The file input restricts to `video/*` via the `accept` attribute but this can be bypassed. Backend URL validation is the only server-side check.
- **No upload progress for Supabase.** Supabase JS client does not expose upload progress events natively. The progress bar in the modal is simulated with fixed steps (30% → 80% → 100%) rather than real byte transfer progress.
- **No video thumbnail generation.** Video cards show a static play icon placeholder. A production implementation would generate thumbnails server-side using FFmpeg after upload and store them alongside the video in Supabase.
- **No file size enforcement on the client.** Very large files will upload without warning. A client-side size check before calling Supabase should be added.

### Real-time Comments

- **Socket disconnects on page navigation.** The socket is fully disconnected when leaving a video page and reconnected when entering another. For a better experience the socket connection should persist across navigation and only the room membership should change.
- **No optimistic UI on comment send.** The comment only appears after the server broadcasts it back. If the Socket.IO connection is slow there is a noticeable delay between submitting and seeing your own comment.
- **No comment deletion or editing.** Comments are permanent once posted.

### Feed and Discovery

- **No search.** There is no way to search for creators or videos by name. All discovery happens through the creators list on the feed page.
- **No infinite scroll or pagination.** The feed loads a fixed maximum of 20 subscribed videos and 10 discovery videos. There is no way to load more.
- **Creator list has no video count or subscriber count.** The creator card shows name and join date only.

### General

- **No loading skeletons on all pages.** Dashboard and feed pages have skeleton loaders but creator profile and video pages use basic conditional rendering without skeletons.
- **No empty state illustrations.** Empty states use plain text. Illustrated empty states significantly improve perceived quality.
- **No error boundaries.** If a component throws an unhandled error the entire page crashes with no fallback UI. React error boundaries should wrap major page sections.
- **Mobile video playback relies on native controls.** The `<video>` element uses the browser's default controls which vary significantly between mobile browsers. A custom player would give consistent behaviour.
- **No PWA support.** The app is not installable and has no offline behaviour. For a content platform this would be a meaningful improvement.
