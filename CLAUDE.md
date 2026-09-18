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

**Every dependency must be pure JavaScript.** `node_modules` lives in the
bind-mounted project root so the host editor gets IntelliSense. A dependency with
a compiled native binary would be installed for Linux and break on the host.
Adding one means moving `node_modules` into a named volume and giving up editor
support — do not do it without asking.

**No htmx in the base environment.** The lab ships as a plain MPA baseline on
purpose: attendees see it without htmx first, then add htmx themselves during the
exercises. Do not add `htmx.org` as a dependency or vendor it into `public/`.

**Hot reload uses polling, deliberately.** `usePolling` in `src/dev-reload.ts`
and `legacyWatch` in `nodemon.json` are not accidents — filesystem events do not
travel reliably across a Docker bind mount on macOS. Do not "optimise" them to
native watching.

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
