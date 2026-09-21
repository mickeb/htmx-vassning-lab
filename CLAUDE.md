# htmx-vassning-lab — notes for AI agents

This is the lab for an htmx presentation. If you are reading this, you are most
likely helping an attendee work through the exercises. Read it before writing
any code here.

The exercises are at <http://localhost:4000/exercises> once the lab is running.
They are the source of truth for what to build; this file is the source of truth
for how this codebase works.

## Who you are helping

An experienced developer who is probably not a Node developer. The typical
attendee writes Java day to day and has solid fundamentals — they know how HTTP
works, what HTML is, and what JavaScript does.
What they have not got is Node, npm, TypeScript's toolchain, or the habits of
the JavaScript ecosystem.

So explain the Node and TypeScript parts, and do not explain a `GET` request, a
form post, a status code or the DOM. Running `npm run typecheck` inside the
container is worth a sentence. `hx-post` sending a form is not — they know what
a form post is. What is new is that the response replaces part of the page
instead of the whole document.

The same cut applies to mistakes. An attendee is far more likely to be tripped
by "the package manager gave me the wrong major version" than by anything about
hypermedia.

## htmx here means htmx 4

Every unqualified mention of htmx in this repo, in the exercises and in anything
you write means **version 4**. Write "htmx 2" explicitly if you ever mean the
older one. The reference is <https://four.htmx.org/>.

Two traps, and both of them look like success:

1. **`npm install htmx.org` installs 2.0.10, not 4**, and an unversioned CDN
   link serves v2 as well. htmx 4 sits on the `next` dist-tag until early 2027.
   Always pin `htmx.org@4.0.0`.
2. **Almost all htmx material in circulation is v2** — tutorials, forum answers,
   and the training data of any AI assistant, including yours. v2 idioms will
   feel right and be wrong. Check the v4 reference rather than recalling.

htmx 4 is a major version with breaking changes from htmx 2. The ones that bite
most often:

- attribute inheritance is explicit now — `hx-confirm:inherited`, not implicit
  inheritance down the tree
- event names were restructured to `htmx:before:request` style
- `hx-vars`, `hx-prompt` and `hx-disinherit` are gone
- back-button navigation **re-fetches** the page instead of restoring a
  `localStorage` snapshot

That last one has a consequence worth holding on to: from the history exercises
onward, a page is also a *response*. Anything that is only safe in a fresh page
load — an out-of-band swap marker, for instance — breaks when Back re-fetches
and swaps that page into `<body>`, and it breaks silently.

htmx is loaded with an **import map**, so the version pin lives in exactly one
line:

```html
<script type="importmap">
{ "imports": { "htmx.org": "https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/htmx.esm.js" } }
</script>
```

## The app ships without htmx. That is the point.

The lab starts as a plain multi-page application: every search, sort, tick and
post is a full page load. The attendee converts it to htmx themselves, exercise
by exercise, starting with the import map above.

So if the codebase looks like it is missing htmx, it is not broken — the
exercises put it there.

## Hard constraints

**No build step.** No bundler, no transpile step, no framework CLI. The value of
this lab is that you edit a file and reload the page. TypeScript works only
because Node 24 strips types at runtime, which is why `erasableSyntaxOnly` is on
in `tsconfig.json` — anything needing real compilation (enums, decorators,
parameter properties) will not run.

**Node runs in Docker. Nothing is installed on the host.** The attendee edits
files in their own editor; the server runs in a container with the project root
bind-mounted. Never tell someone to run `npm install`, `node` or `npx` on their
machine — it may not be there at all.

**Do not add a dependency without asking.** The constraints that keep this lab
turnkey are easy to break from the inside, and the reasons live in the
presentation repo (see the bottom of this file).

## The todo app

`/todo-app` is the application the exercises operate on.

The table has three columns: created at (sortable), description, and complete.
The last one holds the Complete button while there is something to do, and a
tick once there is not — one column, not a status column plus an action column.

### Where you work

| Path | What it is |
| --- | --- |
| `views/layout.liquid` | The page shell. The import map goes here. |
| `views/todo-app/` | The app's templates. **Most exercise work is here.** |
| `public/css/app.css` | Styles. |
| `public/js/app.js` | Browser JavaScript. |
| `src/app.ts` | The todo app's request handlers: parse input, call a lib function, render a template. Some exercises add a branch here. |

And where you do not:

| Path | Why not |
| --- | --- |
| `src/lib/todos.ts` | Every SQL statement in the app. No exercise touches it. |
| `src/server.ts` | Setup and configuration — Liquid, static files, startup. An attendee should never need to open it. |
| `src/lib/db.ts`, `src/sql/schema.sql` | The pool and the schema. |
| `src/dev-reload.ts` | Hot reload. Development only. |
| `exercises-site/` | Generated. Never edit it by hand. |

If a suggestion requires editing something in the second table, that is a
signal the suggestion is wrong. The session is about hypermedia, not about
Express routing or SQL.

### Templates are standalone, on purpose

Every template under `views/todo-app/` renders on its own. They use
`{% render %}`, which is **scope-isolated** in LiquidJS: a partial sees only
what it is passed, so it has to declare what it needs — and can therefore be
returned as a response by itself.

Do not convert them to `{% include %}`. That is exactly what would couple them
to the surrounding page and stop them working as fragments.

### Fragment routes already exist

`/todo-app/fragments/...` returns those same partials without the page around
them. Nothing points at them until an exercise does, and that is deliberate:
attendees should spend the session thinking about htmx, not about wiring up
routes.

They are worth opening directly in a browser. Seeing HTML come back rather than
JSON is most of the idea.

### The empty list is CSS, not a server branch

`todo-table.liquid` always emits **both** the table and the "No todos to show."
message; a `:has()` rule in `app.css` picks which one is visible. The table is
hidden rather than removed, so there is always something in the DOM to target.

Do not replace this with a Liquid conditional.

### The database starts empty

`src/sql/schema.sql` is applied on every boot — and the server reboots every
time a file under `src/` is saved. There is no migration table, no migration
tool and no seed data, so every statement in that file has to be safe to re-run.

## Running it

```bash
./setup.sh                    # build, install, start, verify
docker compose logs -f lab    # server logs
docker compose down           # stop
```

The server runs in the container. To run anything against it:

```bash
docker compose exec lab <command>
```

**Typechecking** is a container job too:

```bash
docker compose run --rm --no-deps lab npm run typecheck
```

Running `npx tsc` on the host fails with "Unable to resolve
`@typescript/typescript-darwin-arm64`". That is expected, not a broken install:
TypeScript 7 ships a platform-specific executable and the one installed here was
resolved for Linux, inside the container.

**Hot reload.** Save a file under `views/` or `public/` and the page reloads by
itself — no build, no manual refresh. Saving under `src/` restarts the server
first, so it takes a moment longer.

The page at <http://localhost:4000/> is an environment self-check with four
indicators. The hot reload one reads `connected` in normal operation, drops to
`reconnecting…` while the server restarts, and comes back on its own. If it says
`not connected` and stays there, the SSE stream never opened — check that the
container is running before looking at anything else.

## Language

**The app's UI is English.** Every string the app renders — headings, labels,
buttons, status text, error messages, everything in `views/` and `public/` — is
English, as is all code, every identifier and this file.

**The exercise prose is Swedish.** So an exercise is an English path containing
Swedish prose that tells the reader to add English UI text. That is intended,
not an oversight. Keep it that way.

## Authoring this lab

Instructions for *building* the lab — its constraints, the conventions the
exercises follow, and how the exercise site is generated — live in the
presentation repo, in `state/LAB-AUTHORING.md`.

If you are an attendee, you do not need them and you do not have that repo.
Nothing in this file depends on it.
