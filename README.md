# htmx-vassning-lab

The lab environment for the htmx vassning. Node runs inside Docker, so you do
**not** need Node, npm or any JavaScript tooling installed. You edit files in
your own editor; the server in the container picks the changes up immediately.

## Requirements

[Docker Desktop](https://www.docker.com/products/docker-desktop/), running.
That's it.

## Getting started

```bash
git clone git@github.com:mickeb/htmx-vassning-lab.git
cd htmx-vassning-lab
docker compose up
```

The first run downloads Node and Postgres and takes a minute or two. Then open
<http://localhost:4000>.

You should see a page reporting four checks — server, stylesheet, JavaScript and
hot reload. If all four are green, you're ready.

The application you will be working on is the todo app at
<http://localhost:4000/todo-app>. It starts out empty, and as an ordinary
multi-page app: every search, sort, tick and form post reloads the whole page.
Adding a few todos is a good way to get a feel for it.

If port 4000 is taken, `LAB_PORT=4002 docker compose up`.

## Everyday commands

```bash
docker compose up -d          # start in the background
docker compose logs -f lab    # follow the server logs
docker compose restart lab    # restart the server
docker compose down           # stop the lab (your todos are kept)
docker compose down -v        # stop the lab and delete all todos
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

## Troubleshooting

**Docker isn't running.** Start Docker Desktop, wait for it to report that it's
running, then try again.

**The page doesn't reload when I save.** Check that the "Hot reload" line on the
page says `connected`. If it doesn't, `docker compose restart lab`.

**I want my todo list back to empty.** `docker compose down -v` deletes the
database; starting again begins from nothing.

**Something is badly broken.** Reset and start over:

```bash
docker compose down -v
rm -rf node_modules
docker compose up
```
