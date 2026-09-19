# htmx-vassning-lab — notes for AI agents

Lab environment for an HTMX presentation. Attendees clone this, run
`./setup.sh`, and work through exercises in their own editor while Node runs in
Docker.

## Audience

Mixed programming backgrounds — many attendees do not work with Node day to day
and are not expected to have it installed. Everything Node-related happens inside
the container. Keep explanations and error messages free of Node-specific jargon.

**Language: only the teaching material is Swedish.** Exercise prose is written in
**Swedish**. Everything else in this repo is **English**, including things
attendees see:

- the web UI — every string the app renders, all of `views/` and `public/`
- `README.md`, the setup guide
- folder and file names, including exercise folders
- code, identifiers, htmx attributes, comments, this file

An exercise is an English path containing Swedish prose, instructing the reader
to add English UI text. That is intended.

## Hard constraints

**No build step.** No bundler, no transpile step, no framework CLI. The value of
this lab is that you edit a file and reload. TypeScript is allowed only because
Node 24 strips types at runtime — `erasableSyntaxOnly` is on in `tsconfig.json`
to keep it that way.

**No dependency may ship a compiled binary.** `node_modules` lives in the
bind-mounted project root so the host editor gets IntelliSense. A dependency with
a native binary would be built for Linux in the container and break on the host.
Adding one means moving `node_modules` into a named volume and giving up editor
support — do not do it without asking.

Verified 2026-09-18: zero `.node` files after `./setup.sh`. Known exception,
benign: `nodemon` -> chokidar 3 lists `fsevents` as an optional macOS-only
dependency. The container install skips it (`os: ["darwin"]`); a host `npm
install` picks it up, and chokidar guards the import in a try/catch. Do not
treat its presence as a breakage.

Re-verified 2026-09-19 after adding `pg` 8.23: still zero `.node` files. `pg` is
pure JavaScript — `pg-native` is an *optional peer* dependency and is not
installed.

One caveat the `.node` check does not catch: **TypeScript 7 ships a
platform-specific executable**, pulled in as an optional dependency
(`@typescript/typescript-<os>-<arch>`). Installing in the container resolves the
Linux one, so `npx tsc` on a macOS host fails with "Unable to resolve
@typescript/typescript-darwin-arm64". That is expected, not a broken install —
run `docker compose run --rm --no-deps lab npm run typecheck` instead. It is a
devDependency and never runs in the browser or the server, so it does not
threaten the bind-mount constraint; it just means the `.node` file count is not
the whole test.

**No htmx in the base environment.** The lab ships as a plain MPA baseline on
purpose: attendees see it without htmx first, then add htmx themselves during the
exercises. Do not add `htmx.org` as a dependency or vendor it into `public/`.

**"htmx" always means htmx 4 here** — <https://four.htmx.org/>. Any unqualified
mention of htmx means version 4; write "htmx 2" explicitly if you ever mean the
older one. Two traps:

1. `npm install htmx.org` installs **2.0.10**, not 4, and an unversioned CDN link
   serves v2. htmx 4 is on the `next` dist-tag until early 2027. Always pin
   `htmx.org@4.0.0`. It is loaded via an import map pointing at jsDelivr, so
   that pin lives in exactly one line.
2. Almost all htmx material in circulation is v2 — including your training data
   if you are an AI assistant. v2 idioms will feel right and be wrong. Check the
   v4 reference rather than recalling.

htmx 4 is a major version with breaking changes: attribute inheritance is now
explicit (`hx-confirm:inherited`), event names were restructured to
`htmx:before:request` style, `hx-vars` / `hx-prompt` / `hx-disinherit` are gone,
and back-button navigation re-fetches instead of restoring a `localStorage`
snapshot. Full notes: `state/research/htmx-4.md` in the presentation repo.

**Hot reload polls by default, deliberately.** Not because macOS needs it —
measured 2026-09-18, native watching works fine on macOS with VirtioFS. The
reason is hosts where inotify does *not* cross the bind mount: Windows with the
project on the Windows filesystem rather than inside WSL2, and older Docker
Desktop using gRPC-FUSE. Native failing there is a nasty failure mode, because
the page still reports hot reload as "connected" while nothing actually reloads.

Cost of polling, measured: ~520ms mean and jittery, versus ~160ms and steady for
native. Imperceptible for save-and-look.

`LAB_WATCH_POLL=false` opts into native watching. Do not change the default, and
do not remove `legacyWatch` from `nodemon.json` (server restarts are rarer and
not latency-sensitive, so that one stays on polling unconditionally).

## Layout

| Path | Purpose |
| --- | --- |
| `setup.sh` | One-command setup. Must fail with sentences, never a stack trace. |
| `src/server.ts` | Setup and configuration only — Liquid, static files, startup. Attendees should never need to open it. |
| `src/app.ts` | The todo app's request handlers. Parse input, call a lib function, render a template. Nothing else. |
| `src/lib/db.ts` | Pool and `migrate()`. |
| `src/lib/todos.ts` | Every SQL statement in the app. Attendees never touch this. |
| `src/sql/schema.sql` | The whole database. |
| `src/dev-reload.ts` | SSE hot reload. Development only. |
| `views/` | Liquid templates. `layout.liquid` is the shell; `views/todo-app/` is the app. |
| `public/` | CSS and browser JS, served as-is. |
| `exercises/` | Exercise material, in Markdown. See `exercises/README.md` for the convention and the build. |
| `exercises-site/` | The exercise site, generated from `exercises/` and committed. Never edit by hand. |
| `mkdocs.yml` | Material for MkDocs config for that site. Pinned to 9.7.7, run from Docker. |

`views/index.liquid` is an environment self-check with four indicators (server,
stylesheet, JavaScript, hot reload). Keep all four working — it is the first
thing an attendee sees and how they diagnose a broken setup.

## The todo app

`/todo-app` is the application the exercises operate on. It is a plain
multi-page app: every search, sort, tick and post is a full page load. That is
the point — attendees convert it to htmx themselves.

The table has three columns: created at (sortable), description, and complete.
The last one holds the Complete button while there is something to do and a tick
once there is not — one column, not a status column plus an action column.

**Every template under `views/todo-app/` renders standalone.** They use
`{% render %}`, which is scope-isolated, so each partial has to declare what it
needs and can therefore be returned on its own. Do not convert them to
`{% include %}`; that is what would couple them to the page.

**Fragment routes ship in the baseline.** `/todo-app/fragments/...` returns the
same partials without the page around them. Nothing uses them until an exercise
points at them, and that is deliberate: attendees should spend the session
thinking about htmx, not about Express routing. Exercises name these URLs so
attendees can open one in a browser and see that HTML, not JSON, comes back.
This supersedes the "no fragment routes" clause in the presentation repo's
`DECISIONS.md` entry of 2026-09-18; the rest of that decision stands.

**`src/sql/schema.sql` is applied on every boot** — which means every time a
file under `src/` is saved, because nodemon restarts the server. Every statement
in it must be safe to re-run. There is no migration table, no migration tool and
no seed data. The app starts empty on purpose.

**The empty list is handled in CSS, not on the server.** `todo-table.liquid`
always emits both the table and the "No todos to show." message, and a `:has()`
rule in `app.css` picks which is visible. The table is hidden rather than
removed so `#todo-rows` is always there to append to — an exercise appends a row
client-side, and the message has to get out of the way without a round trip.
Do not replace this with a Liquid conditional.

## Commands

```bash
./setup.sh                    # build, install, start, verify
docker compose logs -f lab    # server logs
docker compose down           # stop
npm run typecheck             # tsc --noEmit (needs deps installed)
```

The server runs in the container, not on the host. To run something against it:
`docker compose exec lab <command>`.

## Status

The environment and the todo app are complete and verified.

**Exercises 1 and 2 are written; the other seven are not.** The progression they
follow is written up in the presentation repo, in `state/EXERCISES.md`, and that
file is the source of truth for it — but it is not frozen. Sections 1 and 2 both
moved while their prose was being written, and section 2 turned out to specify an
`hx-get` that does not work.

**Run an exercise against the lab before writing its prose.** That is how the
section 2 error surfaced, and it had survived because the failure looked like
success: the first click did the right thing and every click after it did
nothing.

**Exercises are read as a site, not as raw Markdown.** Material for MkDocs
builds `exercises/` into `exercises-site/`, which is committed and served at
`http://localhost:4000/exercises`. The build runs from a Docker image and never
touches an attendee's machine, which is what keeps the no-build-step constraint
intact — see `exercises/README.md` for the commands and the hint syntax, and the
presentation repo's `DECISIONS.md` for why Material and what was rejected.

**Rebuild and commit `exercises-site/` whenever `exercises/` changes.** It is
generated output, so it goes stale silently if that step is skipped.
