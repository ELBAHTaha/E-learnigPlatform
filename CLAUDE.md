# CLAUDE.md

Guidance for working in this repository.

## What this is

**AFG Academy** — a training-academy web app (Morocco, all UI text in **French**).
Two parts in one repo:

- **Frontend** (repo root) — React 18 + TypeScript SPA (Vite, Tailwind, React Router v6,
  TanStack Query, React Hook Form + Zod, Zustand, Recharts).
- **Backend** (`backend/`) — Laravel 11 REST API (PHP 8.2+, Sanctum bearer tokens,
  spatie/laravel-permission, API Resources, Form Requests, Policies).

Four roles: **admin**, **formateur** (trainer), **eleve** (student), **conseiller**
(immigration advisor). Each has its own dashboard.

## Run it locally

Two terminals. Full details in [README.md](README.md) / [backend/README.md](backend/README.md).

```powershell
# Terminal 1 — backend API  (cwd: backend/)
php artisan serve --host=127.0.0.1 --port=8000        # http://localhost:8000/api

# Terminal 2 — frontend SPA  (cwd: repo root)
npm run dev                                            # http://localhost:5173
```

Optional: `php artisan queue:work` (emails + meeting-link creation jobs).

Demo logins: `admin@afg-academie.com`, `y.bennani@afg-academie.com`,
`yassine.elfassi@afg-academie.com`, `a.zaki@afg-academie.com` — all password **`demo`**.
Other seeded users use **`password`**.

## Local database — IMPORTANT

Production targets **MySQL/MariaDB** (Hostinger), but local dev here runs on **SQLite**
(this machine has no MySQL). `backend/.env` is set to `DB_CONNECTION=sqlite` with the
file at `backend/database/database.sqlite`; the MySQL lines are commented out just below
for production. Reset data with:

```powershell
cd backend ; php artisan migrate:fresh --seed
```

## Frontend ↔ backend contract (do not break these)

The Laravel API is a **drop-in replacement** for the SPA's old mock layer. Every
`src/api/*.ts` client has a mock branch and a real-HTTP branch, toggled by
`VITE_USE_MOCKS` in the root `.env` (currently `false` → real backend at
`VITE_API_BASE_URL=http://localhost:8000/api`).

Contract rules the backend must keep matching:
- **Bare JSON, no `data` envelope.** List endpoints return a **plain array** — the SPA
  calls `.filter()` on the result directly. (`/notifications` and `/stats/overview`
  return objects, but the SPA does not consume them.)
- **camelCase** field names; **IDs are strings**.
- Error envelope: `{ "message": "...", "errors": { field: [...] } }` with proper status
  codes (401/403/404/409/422).
- Auth token is read from `localStorage["afg.token"]` and sent as `Authorization: Bearer`.
- Routes live in [backend/routes/api.php](backend/routes/api.php); they mirror the
  `src/api/*` clients (plus spec-style aliases like `/immigration/*`).

When adding/changing an endpoint, update **both** the Laravel side (route + Controller +
FormRequest + Resource) **and** the matching `src/api/*.ts` client + `src/types/index.ts`.

## Layout

```
src/                      # frontend
  api/        one module per domain (auth, users, formations, courses, enrollments,
              schedule, rooms, grades, immigration, announcements) — mock + real branches
  pages/      public/, auth/, eleve/, formateur/, admin/, conseiller/
  components/ ui/ (design system) + layout/
  features/   schedule, courses, announcements, immigration, chatbot
  store/      auth.ts (zustand + persist, key "afg.auth")
  lib/        httpClient.ts (fetch wrapper + useMocks flag), constants, format
  routes/     AppRouter + RequireAuth role guard + dashboardNav
  types/      shared TS interfaces (the contract source of truth on the FE)

backend/app/Http/
  Controllers/Api/   one per domain
  Requests/          validation (camelCase input rules)
  Resources/         JSON output shaping (camelCase, string IDs)
backend/app/Policies/        role/ownership authorization
backend/database/
  migrations/  seeders/ (RolePermissionSeeder, PoleCategorySeeder, DemoDataSeeder)
```

## Authorization model (spatie + Policies)

Permissions are seeded in `RolePermissionSeeder` and enforced via **Policies** with a
`Gate::before` admin bypass. Expect (correct, not bugs):
- A **formateur** can only manage grades/assessments/materials for formations where
  `formation.formateur_id === user.id` (else **403**).
- `GET /me/formations` is **élève-only** (enrolled+approved courses). Formateur pages
  instead fetch all formations and filter client-side by `formateurId`.

## Tests

```powershell
cd backend ; php vendor/bin/phpunit          # 36 feature tests: auth, per-role access,
                                             # enrollment, grades, file gating, immigration, chatbot
npm run lint                                 # frontend: tsc --noEmit
npm run build                                # tsc --noEmit && vite build
```

The frontend has no JS test runner; type-check + build is the gate.

## Gotchas / known constraints

- **Registration** posts `password` + snake_case `password_confirmation` (Laravel
  `confirmed` rule). The `src/api/auth.ts` client sends both — keep it that way.
- Assessment `type` must be one of `devoir` | `examen` | `quiz`.
- Corrigés and immigration documents live on the **private** disk and are only reachable
  through gated controller routes (`/materials/{id}/download`, `/documents/{id}/download`),
  never a public URL.
- Meeting links: `MEETING_DEFAULT_PROVIDER=manual` by default (no credentials needed);
  `zoom` / `google_meet` fall back to a manual link if creds/API fail.
- If you edit `backend/.env`, run `php artisan config:clear`.
