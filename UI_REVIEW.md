# UI Review

## Screenshot capture status

I ran the web app locally with the required public environment variables and attempted to capture desktop and mobile screenshots for every major surface into `screenshots/`.

Screenshot capture is currently blocked by the container image rather than by application code:

- Playwright is installed, but its Chromium executable is not present in `/root/.cache/ms-playwright`.
- `pnpm exec playwright install chromium` was attempted from `apps/web`, but the browser download endpoint returned `403 Forbidden` repeatedly.
- `apt-get install chromium` was also attempted, but the Ubuntu package mirrors are blocked by the same `403 Forbidden` proxy behavior.
- No system browser (`chromium`, `chromium-browser`, `google-chrome`, or `firefox`) is available on `PATH`.

Because of that environment limitation, there are no real browser screenshots to embed yet. The intended screenshot manifest is listed below so the same capture pass can be rerun immediately in an environment with a browser installed.

## Intended screenshot manifest

| Surface                   | Route                    | Desktop target                                | Mobile target                                |
| ------------------------- | ------------------------ | --------------------------------------------- | -------------------------------------------- |
| Marketing site            | `/`                      | `screenshots/marketing-home-desktop.png`      | `screenshots/marketing-home-mobile.png`      |
| Demo launcher             | `/demo`                  | `screenshots/demo-launcher-desktop.png`       | `screenshots/demo-launcher-mobile.png`       |
| Organizer dashboard       | `/org`                   | `screenshots/organizer-dashboard-desktop.png` | `screenshots/organizer-dashboard-mobile.png` |
| Organizer events          | `/org/events`            | `screenshots/organizer-events-desktop.png`    | `screenshots/organizer-events-mobile.png`    |
| Organizer analytics       | `/org/analytics`         | `screenshots/organizer-analytics-desktop.png` | `screenshots/organizer-analytics-mobile.png` |
| Organizer users           | `/org/users`             | `screenshots/organizer-users-desktop.png`     | `screenshots/organizer-users-mobile.png`     |
| Organizer settings        | `/org/settings`          | `screenshots/organizer-settings-desktop.png`  | `screenshots/organizer-settings-mobile.png`  |
| Exhibitor portal root     | `/exhibit`               | `screenshots/exhibitor-portal-desktop.png`    | `screenshots/exhibitor-portal-mobile.png`    |
| Attendee directory        | `/e/techexpo-2027`       | `screenshots/attendee-directory-desktop.png`  | `screenshots/attendee-directory-mobile.png`  |
| Attendee saved exhibitors | `/e/techexpo-2027/saved` | `screenshots/attendee-saved-desktop.png`      | `screenshots/attendee-saved-mobile.png`      |
| Authentication            | `/auth`                  | `screenshots/auth-desktop.png`                | `screenshots/auth-mobile.png`                |
| Admin                     | `/admin`                 | `screenshots/admin-desktop.png`               | `screenshots/admin-mobile.png`               |

## Local route audit

The local server was started with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dummy NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 pnpm --filter web dev
```

Observed route behavior:

- `/` renders the marketing homepage successfully.
- `/demo` renders the demo launcher successfully.
- `/auth` renders the polished auth fallback successfully.
- Protected app surfaces (`/org`, `/exhibit`, `/admin`, `/e/...`) redirect to `/auth?next=...` without a valid Supabase session, which is expected for the current middleware behavior.

## Improvements made after review

- Replaced the remaining visible shell placeholder at `/auth` with a centered, branded authentication fallback and clear demo/home CTAs.
- Replaced the visible `/admin` placeholder with a premium platform operations landing surface.
- Replaced the visible `/exhibit` placeholder with a polished exhibitor portal landing surface that points presenters toward seeded exhibitor demos.
- Preserved backend, middleware, auth, database, deployment, and API contract behavior while improving presentation-only routes.

## Visual issues found and fixed

| Issue                                                                  | Resolution                                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/auth` displayed bare implementation copy.                            | Added branded card, explanatory copy, accessible CTAs, and premium styling.             |
| `/admin` displayed a milestone shell heading.                          | Added metrics, health status, and operational checklist presentation.                   |
| `/exhibit` displayed a milestone shell heading.                        | Added exhibitor value proposition, CTA, and three polished portal highlight cards.      |
| Protected-route screenshots were not directly accessible without auth. | Documented redirect behavior and kept auth fallback polished for unauthenticated demos. |

## Remaining recommendations

- Install a browser in the CI/dev image so Playwright screenshot capture and visual regression can run reliably.
- Add authenticated fixture sessions or a visual-review bypass fixture for protected pages, without changing production middleware behavior.
- Continue replacing older authenticated dashboard table/card patterns with shared premium primitives once authenticated screenshot access is available.
