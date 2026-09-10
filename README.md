# Artisan Finder — Yenagoa

**Brief:** SD-06 — Build an app that helps users find and book trusted artisans.
**Owned & managed by:** Agele Jonathan · Yenagoa, Bayelsa State, Nigeria

A full-stack web app: Node.js + Express backend, SQLite database, vanilla HTML/CSS/JS frontend.
No build step — clone it, install, run.

---

## Core MVP features (per brief)

| Requirement | Status | Where |
|---|---|---|
| Artisan profiles | ✅ | `GET/POST /api/artisans` |
| Search functionality | ✅ | `GET /api/artisans?trade=&area=&q=` |
| Booking functionality | ✅ | `POST /api/bookings`, artisan confirm/decline/complete dashboard |
| Deployment | ⚠️ Deploy-ready, not yet deployed to a live URL — see **Deploying** below |

---

## Running it locally

Requires [Node.js](https://nodejs.org) **22.5 or later** (the app uses Node's built-in `node:sqlite`
module, so there's no native compiler/build-tools step — `npm install` just works, even on a fresh
machine). Check your version with `node -v`; if you're on an older Node, install the current LTS
from nodejs.org first.

```bash
npm install
npm start
```

Then open **http://localhost:3000**. You'll see a small experimental-feature warning about SQLite
printed on startup — that's expected and harmless, Node just flags `node:sqlite` as experimental.

On first run, a SQLite database is created at `db/artisan-finder.db` and seeded with 10 sample
artisans so the app isn't empty. Your own registrations and bookings are saved there and persist
across restarts (this file is gitignored — it's local data, not source code).

To reset to a clean, empty database, stop the server and delete `db/artisan-finder.db*`.

---

## How the app works

**Find an Artisan** — search by name/trade, filter by trade category or area, then either
call, WhatsApp, or **Book** an artisan directly from their profile card.

**Register** — any artisan can add themselves to the directory: name, trade, area, phone,
WhatsApp, years of experience, short bio. Their phone number doubles as their login for the
bookings dashboard below.

**Manage My Bookings** — an artisan enters the phone number they registered with to see every
booking request made against their profile, and can **Confirm**, **Decline**, or (once confirmed)
**mark a job Completed**. This is the booking functionality required by the brief — it's a real
state machine (`pending → confirmed/declined → completed`) backed by the database, not just a
contact button.

There's no login/password system in this MVP — access to "my bookings" is by phone number, the
same way a real-world artisan would be reachable. Adding real authentication would be a natural
next step.

---

## API reference

All endpoints are under `/api`. JSON in, JSON out.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/artisans?trade=&area=&q=` | List/search artisans |
| GET | `/api/artisans/:id` | Get one artisan's profile |
| POST | `/api/artisans` | Register a new artisan |
| POST | `/api/bookings` | Create a booking request |
| GET | `/api/bookings/mine?phone=` | An artisan's own bookings, by their phone number |
| GET | `/api/bookings/:id` | Look up a single booking (with artisan info) |
| PATCH | `/api/bookings/:id` | Update a booking's status (`confirmed`/`declined`/`completed`) |

Valid trades: `electrician`, `plumber`, `carpenter`, `welder`, `tailor`, `mechanic`, `ac_gen`,
`painter`, `mason`, `electronics`.

---

## Project structure

```
artisan-finder-app/
  server.js           Express app + all API routes
  db/
    schema.sql         Table definitions (artisans, bookings)
    database.js         Opens/creates the SQLite DB (via node:sqlite), runs schema, seeds sample data on first run
    seed.js              Sample artisan data used only when the DB is empty
  public/
    index.html           Page markup (find / register / manage-bookings views + booking modal)
    style.css              All styling
    script.js               Frontend logic — calls the API above, no framework
  package.json
  Procfile              For Heroku/Render-style platforms
  .gitignore
```

---

## Deploying

The app is a single Node process serving both the API and the static frontend, so it deploys
anywhere Node apps run. It hasn't been deployed to a live URL yet — do this to get one:

**Render.com (free tier, easiest)**
1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com) → New → Web Service → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Deploy. Render gives you a public `https://your-app.onrender.com` URL.

**Railway.app** — same idea: connect the repo, it auto-detects Node, deploys, gives you a URL.

**Note on the database:** the app writes to a local SQLite file (`db/artisan-finder.db`) via
Node's built-in `node:sqlite` — no separate database server or native build step needed. This
works fine for a demo/MVP, but most free hosting tiers use an *ephemeral* filesystem — the
database resets on every redeploy (not on every restart, but whenever you push new code). For
anything beyond a demo, swap in a hosted Postgres database (e.g. Render's free Postgres, Neon, or
Supabase) — the brief explicitly allows PostgreSQL as an alternative, and only `db/database.js`
and the SQL in `server.js` would need to change; the API and frontend stay the same.

**Make sure your host uses Node 22.5+.** On Render/Railway you can pin this via the `engines`
field already set in `package.json`, or an explicit Node version setting in the platform's
dashboard.

---

## Demo video

Not included in this delivery — I can't record a screen walkthrough from here. A natural
2–3 minute structure, if you record one:
1. (0:00–0:30) Problem + goal, one line each.
2. (0:30–1:15) Find an Artisan: search by trade/area, open a profile, hit Book, fill the form, submit.
3. (1:15–2:15) Register a new artisan, then switch to Manage My Bookings with that phone number,
   confirm the booking you just made, mark it completed.
4. (2:15–2:45) Quick look at the code structure and the deployed URL.

---

## What's deliberately out of scope for this MVP

- Authentication/passwords (phone-number lookup stands in for login)
- Ratings/reviews
- Artisan verification (ID/NIN, guarantor)
- Payments
- SMS/WhatsApp automated notifications on booking status change
