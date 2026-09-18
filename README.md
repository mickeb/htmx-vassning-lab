# htmx-vassning-lab

The lab environment for the HTMX vassning. Node runs inside Docker, so you do
**not** need Node, npm or any JavaScript tooling installed. You edit files in
your own editor; the server in the container picks the changes up immediately.

## Requirements

[Docker Desktop](https://www.docker.com/products/docker-desktop/), running.
That's it.

## Getting started

```bash
git clone git@github.com:mickeb/htmx-vassning-lab.git
cd htmx-vassning-lab
./setup.sh
```

The script builds the container, installs dependencies, starts the server and
opens <http://localhost:4000>.

You should see a page reporting four checks — server, stylesheet, JavaScript and
hot reload. If all four are green, you're ready.

Re-running `./setup.sh` is always safe.

### If port 4000 is taken

```bash
LAB_PORT=4002 ./setup.sh
```

## Working in the lab

Open the project folder in your editor and change any file under `views/`,
`public/` or `src/`. The browser reloads on its own — there is no build step and
nothing to compile.

| You change | What happens |
| --- | --- |
| `views/*.liquid` | Rendered fresh on the next request; the browser reloads |
| `public/**` | The browser reloads |
| `src/*.ts` | The server restarts, then the browser reloads |

Reloads land in about half a second. If you want them snappier and your setup
supports it, `LAB_WATCH_POLL=false docker compose up -d` switches to native
filesystem watching (~160ms). The default polls, because that works on every
host; native watching silently does nothing on some Windows setups.

## Everyday commands

```bash
docker compose logs -f lab    # follow the server logs
docker compose restart lab    # restart the server
docker compose down           # stop the lab
./setup.sh                    # start it again
```

## What's in here

```
setup.sh            One-command setup. Start here.
compose.yaml        Container definition and port mapping
Dockerfile          The Node 24 runtime image
src/server.ts       Express server and routes
src/dev-reload.ts   Hot reload (development only)
views/              Liquid templates
public/             CSS and browser JavaScript, served as-is
exercises/          Exercise material (none written yet)
```

## The stack

| | |
| --- | --- |
| Runtime | Node 24 LTS, in Docker |
| Server | [Express 5](https://expressjs.com/) |
| Templates | [LiquidJS](https://liquidjs.com/) — the `{% if %}` / `{{ value }}` syntax you may know from Jinja2, Twig, Django or Shopify |
| Styling | Plain CSS |
| Browser JS | Plain JavaScript, no bundler |

TypeScript is available and runs directly — Node 24 strips the types itself, so
there is still no build step. Types are optional; `npm run typecheck` checks them
if you want it.

## Troubleshooting

**The setup script says Docker isn't running.** Start Docker Desktop, wait for
it to report that it's running, then try again.

**The page doesn't reload when I save.** Check that the "Hot reload" line on the
page says `connected`. If it doesn't, `docker compose restart lab`.

**Something is badly broken.** Reset and start over:

```bash
docker compose down
rm -rf node_modules
./setup.sh
```

## A note on dependencies

`node_modules` lives in the project folder (not in a Docker volume) so your
editor can see it and give you autocompletion. That works because nothing here
ships a compiled binary: `./setup.sh` installs inside the Linux container, and
the result is portable to your machine.

Adding a dependency with a native binary would break this, because the one built
for Linux in the container would not run on your host. If you need one, install
it into a named volume instead.

One nuance, if you go looking: `nodemon` depends on chokidar 3, which lists
`fsevents` (a macOS-only native module) as an *optional* dependency. Installing
in the Linux container skips it, which is why there are no `.node` binaries. If
you run `npm install` on your host instead, you will get it — harmless, because
chokidar guards the import and falls back, but it is the one exception to "all
plain JavaScript".
