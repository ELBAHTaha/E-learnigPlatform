# AFG Académie — API (Laravel 11)

REST API powering the **AFG — Académie de Formation Globale** React SPA. It is a
**drop-in replacement** for the frontend's mock layer: the SPA switches from
mocks to this API by setting `VITE_USE_MOCKS=false` and pointing
`VITE_API_BASE_URL` at this server's `/api` prefix. Responses are bare JSON
(no `data` envelope), field names are camelCase, and IDs are strings — exactly
what the frontend `src/api/*` clients expect.

- **Stack:** PHP 8.2+ / Laravel 11, MySQL/MariaDB, Sanctum (Bearer tokens),
  spatie/laravel-permission, API Resources, Form Requests, Policies, database
  queues, dedoc/scramble (OpenAPI docs).
- **Auth:** stateless personal-access tokens (the SPA may live on a different
  subdomain), not cookie/session SPA mode.
- **Language:** French (`fr`) — validation messages are translated.

---

## Quick start (local)

```bash
cd backend
cp .env.example .env
php artisan key:generate

# Configure DB in .env (MySQL/MariaDB), then create the database:
#   CREATE DATABASE afg_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

php artisan migrate:fresh --seed
php artisan storage:link          # expose public assets (avatars, cover images)
php artisan serve                 # http://localhost:8000

# Process queued emails / meeting-creation jobs:
php artisan queue:work
```

API base URL: `http://localhost:8000/api` · API docs: `http://localhost:8000/docs/api`

### Point the frontend at this API

In the **frontend** project's `.env`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8000/api
```

CORS: add the SPA origin(s) to `CORS_ALLOWED_ORIGINS` in this project's `.env`
(comma-separated). Default already allows the common Vite ports.

---

## Demo accounts

Seeded by `DemoDataSeeder`. The four accounts wired to the SPA's "demo login"
buttons use the password **`demo`**; **all other** seeded users use
**`password`**.

| Role        | Email                              | Password |
|-------------|------------------------------------|----------|
| Admin       | `admin@afg-academie.com`           | `demo`   |
| Formateur   | `y.bennani@afg-academie.com`       | `demo`   |
| Élève       | `yassine.elfassi@afg-academie.com` | `demo`   |
| Conseiller  | `a.zaki@afg-academie.com`          | `demo`   |

Other notable seeded users (password `password`): a 2nd admin
`direction@afg-academie.com`, 5 more formateurs, a 2nd conseiller
`r.benali@afg-academie.com`, and ~30 élèves.

---

## Roles & permissions

Four roles (spatie), matching the frontend contract: `admin`, `formateur`,
`eleve`, `conseiller` (the immigration advisor, labelled *Conseiller
immigration*). Fine-grained permissions are defined in `RolePermissionSeeder`
and enforced via **Policies** + the `Gate::before` admin bypass.

- **admin** — full CRUD on users, formations, rooms, schedule, announcements;
  approves enrollments; global stats.
- **formateur** — own courses & materials, grades for own formations, own
  schedule, create meetings for own sessions.
- **eleve** — browse catalogue, request enrollment, access enrolled content,
  own schedule/grades, announcements, chatbot, own immigration dossier.
- **conseiller** — manage immigration dossiers, document checklists, messages.

---

## Data model (ER overview)

```
poles 1───* categories
poles 1───* formations *───1 categories
users(formateur) 1───* formations
formations 1───* course_materials        (corrigés live on the PRIVATE disk)
formations 1───* enrollments *───1 users(eleve)        [unique (eleve,formation)]
formations 1───* class_sessions *───1 users(formateur)
                              \───1 rooms (nullable; online sessions have none)
formations 1───* assessments 1───* grades *───1 users(eleve)
users(admin) 1───* announcements          (target_roles JSON; null = everyone)
users(eleve) 1───* immigration_dossiers *───1 users(conseiller)
immigration_dossiers 1───* immigration_documents   (files on the PRIVATE disk)
immigration_dossiers 1───* dossier_messages        (the dossier "notes")
contact_requests                          (chatbot "contacter un conseiller")
notifications (Laravel) — in-app + queued email
```

The "séances" table is named **`class_sessions`** to avoid colliding with
Laravel's HTTP session table (this API is stateless, `SESSION_DRIVER=file`).

---

## API surface (all under `/api`)

Mirrors the frontend `src/api/*` clients; spec-style aliases are also provided.

- **auth** — `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
  `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- **users** (admin) — `GET/POST /users`, `GET/PATCH/DELETE /users/{id}`,
  `PUT /users/{id}/status`; **profile** — `GET/PUT /profile`, `POST /profile/avatar`
- **catalogue** (public read) — `GET /formations` (filters: `pole`,
  `subcategory`, `level`, `search`), `GET /formations/{id|slug}`, `GET /poles`,
  `GET /categories?pole=`; admin write `POST/PATCH/DELETE /formations/{id}`
- **materials** — `GET /resources?formationId=`, `POST /resources` (multipart),
  `DELETE /resources/{id}`, `GET /materials/{id}/download` (corrigés gated)
- **enrollments** — `GET /enrollments`, `POST /enrollments`,
  `POST /enrollments/{id}/decide`, `GET /me/formations`
- **schedule** — `GET /sessions`, `POST /sessions` (conflict-checked),
  `PATCH/DELETE /sessions/{id}`, `POST /sessions/{id}/meeting`,
  `GET /sessions/{id}/join`; **rooms** `GET/POST /rooms`, `PATCH/DELETE /rooms/{id}`
- **grades** — `GET /assessments?formation=`, `POST /assessments`,
  `GET /grades`, `POST /grades`, `DELETE /grades/{id}`, `GET /me/grades`
  (computed averages + progression series)
- **announcements** — `GET /announcements?role=`, `POST /announcements`,
  `DELETE /announcements/{id}`, `POST /announcements/{id}/publish`
- **immigration** — `GET/POST /dossiers`, `GET /dossiers/{id}`,
  `POST /dossiers/{id}/status`, `POST /dossiers/{id}/notes`,
  `POST /dossiers/{id}/documents`, `PATCH /dossiers/{id}/documents/{docId}`,
  `POST /documents/{id}/upload`, `PUT /documents/{id}/verify`,
  `GET /documents/{id}/download` (aliased under `/immigration/dossiers/*`)
- **chatbot** — `POST /chatbot/message`, `POST /chatbot/contact`
- **stats** (admin) — `GET /stats/overview`
- **notifications** — `GET /notifications`, `POST /notifications/{id}/read`,
  `POST /notifications/read-all`

Errors use a consistent envelope: `{ "message": "...", "errors": { field: [..] } }`
with proper HTTP status codes (422, 401, 403, 404, 409).

---

## File storage

Two disks (`config/filesystems.php`):

- **`public`** — cover images, avatars, public materials. Served via
  `php artisan storage:link`.
- **`private`** (`storage/app/private-files`) — corrigés and immigration
  documents. **Never** served by a direct URL; only through authorized
  controller routes (`/materials/{id}/download`, `/documents/{id}/download`)
  which check enrollment/role.

Uploads are validated (mime + size) and stored with hashed names; the original
filename is kept in the database.

---

## Visioconférence (Zoom / Google Meet)

`MeetingService` has three drivers selected by `MEETING_DEFAULT_PROVIDER`:

- **`manual`** (default) — generates a placeholder link; works with **no
  credentials**, so the app is fully functional in development.
- **`zoom`** — Server-to-Server OAuth (`ZOOM_ACCOUNT_ID/CLIENT_ID/CLIENT_SECRET`).
- **`google_meet`** — Google Calendar event with conferenceData
  (`GOOGLE_SERVICE_ACCOUNT_JSON` path).

`POST /api/sessions/{id}/meeting` creates the meeting and stores `meeting_url`
(join, shared with students) and `meeting_host_url` (start, visible only to the
trainer/admin). Both real providers gracefully fall back to a manual link if
credentials are missing or the API call fails.

---

## Chatbot

A deterministic, rule-based assistant (`App\Services\Chatbot\ChatbotService`) —
a server-side port of the frontend `engine.ts`, backed by **live** formations
data. It covers the six areas (formations, tarifs, inscription, planning,
documents, contact) and returns `{ reply, quickReplies:[{label,payload,value}],
payload? }`. `POST /chatbot/contact` records a `contact_request`, optionally
appends a dossier message, and queues an email to the academy.

---

## Tests

Feature tests (PHPUnit) cover auth, role access (allowed + forbidden per role),
the enrollment flow, grade entry, file-access control (corrigés), the
immigration workflow, and the chatbot.

```bash
composer test          # clean run (uses the deprecation baseline — see note)
# or:
php vendor/bin/phpunit --use-baseline=tests/phpunit-baseline.xml
```

Tests run against a separate `afg_academy_test` database (configured in
`phpunit.xml`); create it once with the same `CREATE DATABASE` statement.

> **PHP 8.5 note:** PHP 8.5 deprecates the `PDO::MYSQL_ATTR_SSL_CA` constant,
> which Laravel's *bundled* `config/database.php` still references. This is a
> harmless third-party deprecation (the suite passes with exit code 0); the
> committed `tests/phpunit-baseline.xml` keeps the output clean until Laravel
> ships the `Pdo\Mysql::` constant. Our own `config/database.php` already guards
> the constant.

---

## Hostinger deployment notes

1. **PHP** 8.2+ with `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `curl`,
   `gd` (recommended). Set the domain's **document root to `public/`**.
2. **MySQL/MariaDB:** create a database + user in hPanel, set `DB_*` in `.env`.
3. **Deploy:** upload code (or git), then:
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan key:generate            # first deploy only
   php artisan migrate --force         # add --seed for an initial demo dataset
   php artisan storage:link
   php artisan config:cache && php artisan route:cache
   ```
4. **Env:** `APP_ENV=production`, `APP_DEBUG=false`,
   `APP_URL=https://api.afg-academie.com`, and set
   `CORS_ALLOWED_ORIGINS=https://www.afg-academie.com`.
5. **Queue worker** (emails + meeting creation). Prefer a Supervisor-style
   process if available; on shared hosting use a cron fallback:
   ```
   * * * * * cd /home/USER/api && php artisan queue:work --stop-when-empty >> /dev/null 2>&1
   ```
6. **Scheduler** (if scheduled tasks are added later):
   ```
   * * * * * cd /home/USER/api && php artisan schedule:run >> /dev/null 2>&1
   ```
7. **Mail:** point `MAIL_*` at Hostinger SMTP (or any provider).
8. **Visio:** set `MEETING_DEFAULT_PROVIDER` + Zoom/Google credentials, or leave
   `manual`.
