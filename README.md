# AFG Academy — Frontend

Web app for **AFG — Académie de Formation Globale**, a multidisciplinary training academy in Morocco.
*Apprenez ici. Brillez partout.*

This repository contains the production-quality React SPA covering:

- a public marketing site (Accueil, À propos, Formations + détail, Contact)
- authentication (Login / Register) with role-aware redirection
- four role-specific dashboards: **Admin**, **Formateur**, **Élève**, **Conseiller immigration**
- a floating chatbot assistant ("Assistance à l'inscription")

All UI text is in French.

## Tech stack

- **React 18** + **TypeScript** (strict)
- **Vite** + **Tailwind CSS**
- **React Router v6** (with role guards)
- **TanStack Query** (data fetching / cache)
- **React Hook Form + Zod** (forms & validation)
- **Zustand** (auth/session/toast state, persisted in `localStorage`)
- **Recharts** (grades, admin stats)
- **date-fns** (French locale)
- **lucide-react** (icons)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the production build
```

## Environment & mock/real backend toggle

There is **no backend yet** — every domain API has a mock implementation that simulates network latency. The api layer is designed so the real backend can be plugged in by flipping a single flag.

Create a `.env.local` (see `.env.example`):

```
VITE_USE_MOCKS=true                          # set to "false" once a backend is wired
VITE_API_BASE_URL=http://localhost:3000/api  # used when mocks are disabled
```

Each api module under [src/api/](src/api/) exposes typed functions whose signatures match the future REST surface. When `VITE_USE_MOCKS=true` they read from [src/mocks/](src/mocks/); when `false` they call `httpClient` ([src/lib/httpClient.ts](src/lib/httpClient.ts)) — a thin `fetch` wrapper that adds the `Bearer` token and the base URL.

## Demo accounts

The login page shows four one-click demo accounts. Any password is accepted in mock mode.

| Rôle | Email |
| --- | --- |
| Administrateur | `admin@afg-academie.com` |
| Formateur | `y.bennani@afg-academie.com` |
| Élève | `yassine.elfassi@afg-academie.com` |
| Conseiller immigration | `a.zaki@afg-academie.com` |

Sessions are persisted in `localStorage` under `afg.auth` (zustand persist) and `afg.token`.

## Project structure

```
src/
  api/            # one module per domain (auth, users, formations, courses, ...)
  components/
    ui/           # design-system primitives (Button, Card, Modal, Table, Toast, ...)
    layout/       # MarketingLayout, DashboardLayout, Sidebar, Topbar, Logo, PageHeader
  features/
    schedule/     # WeeklyCalendar
    courses/      # ResourceList
    announcements/
    immigration/  # StatusTracker
    chatbot/      # Engine + Widget (swappable rule engine)
  pages/
    public/       # Home, À propos, Formations, FormationDetail, Contact
    auth/         # AuthLayout, Login, Register
    eleve/        # 7 screens
    formateur/    # 5 screens
    admin/        # 7 screens
    conseiller/   # 4 screens
    ProfilePage.tsx, SettingsPage.tsx,
    NotFoundPage.tsx (404), ForbiddenPage.tsx (403)
  mocks/          # fixtures + seed data (users, formations, schedule, ...)
  types/          # shared TS interfaces
  lib/            # cn, httpClient, queryClient, format, constants
  store/          # auth store (zustand + persist)
  routes/         # AppRouter + RequireAuth guard + dashboardNav config
  styles/         # globals.css (tailwind base + custom CSS vars)
```

## Design system

- Color tokens defined in `tailwind.config.js`: **navy** (primary `#1B2A4A`), **gold/accent** (`#E8954A`), semantic success / warning / danger / info, neutral grays.
- Typography: **Inter** (body / UI) and **Poppins** (display headings), loaded from Google Fonts.
- Soft shadows (`shadow-card`, `shadow-elevated`), 2xl rounded corners, focus rings on accent, AA contrast.
- A complete UI primitive set lives in [src/components/ui/](src/components/ui/): Button, Input, Select, Textarea, Checkbox, Card, Badge, Avatar, Modal, Drawer, Tabs, Table (sortable + paginated), Toast, Skeleton, EmptyState, Breadcrumbs, Tooltip.

## Plugging in the real backend

1. Set `VITE_USE_MOCKS=false` and point `VITE_API_BASE_URL` at the backend.
2. Mirror the REST routes consumed by each module:
   - `POST /auth/login`, `POST /auth/register`
   - `GET/POST/PATCH/DELETE /users`, `/formations`, `/resources`, `/enrollments`, `/sessions`, `/rooms`, `/grades`, `/dossiers`, `/announcements`
   - Endpoint paths and payload shapes are exactly what the mock modules call — see [src/api/](src/api/).
3. The `Authorization: Bearer <token>` header is added automatically from `localStorage.afg.token`.

## Plugging in a real chatbot

The chatbot UI lives in [src/features/chatbot/ChatbotWidget.tsx](src/features/chatbot/ChatbotWidget.tsx) and reads from a pluggable responder in [src/features/chatbot/engine.ts](src/features/chatbot/engine.ts) (function `generateResponse(input: string): BotResponse`). Replace this function (or make it `async` and call a remote endpoint) without changing the widget.

## Notes

- All forms use Zod validation with French error messages.
- Dashboards include skeleton loaders, empty states, sortable + paginated tables, toast notifications.
- The schedule builder detects formateur and room conflicts before creating a session.
- The chatbot handles the six intents A–F (formations, tarifs, inscription, planning, documents, contact) with both clickable quick-replies and free-text keyword detection.
