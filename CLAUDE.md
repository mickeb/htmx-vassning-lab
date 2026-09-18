# htmx-vassning-lab — notes for AI agents

Lab environment for an HTMX presentation. Attendees clone this, run
`./setup.sh`, and work through exercises in their own editor while Node runs in
Docker.

## Audience

Mixed backgrounds — many attendees do not work with Node day to day and are not
expected to have it installed. Everything Node-related happens inside the
container. Keep explanations and error messages free of Node-specific jargon.

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

**No htmx in the base environment.** The lab ships as a plain MPA baseline on
purpose: attendees see it without htmx first, then add htmx themselves during the
exercises. Do not add `htmx.org` as a dependency or vendor it into `public/`.

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
| `src/server.ts` | Express 5 + LiquidJS. Routes go here. |
| `src/dev-reload.ts` | SSE hot reload. Development only. |
| `views/` | Liquid templates. `layout.liquid` is the shell. |
| `public/` | CSS and browser JS, served as-is. |
| `exercises/` | Exercise material. See `exercises/README.md` for the convention. |

`views/index.liquid` is an environment self-check with four indicators (server,
stylesheet, JavaScript, hot reload). Keep all four working — it is the first
thing an attendee sees and how they diagnose a broken setup.

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

The environment is complete. **Exercise content has not been written** —
`exercises/` holds only the documented convention.
