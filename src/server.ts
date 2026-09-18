import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { Liquid } from 'liquidjs'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const isDev = process.env.NODE_ENV !== 'production'
const port = Number(process.env.PORT ?? 4000)

// Identifies this particular process. The browser holds on to it and compares
// it after an SSE reconnect; a different value means the server restarted and
// the open page is stale. See dev-reload.ts.
const bootId = `${process.pid}-${Date.now()}`
const bootTime = new Date().toISOString().replace('T', ' ').slice(0, 19)

const app = express()

const liquid = new Liquid({
  root: join(projectRoot, 'views'),
  extname: '.liquid',
  // Templates are re-read per request in dev, so editing a .liquid file shows
  // up immediately without restarting the server.
  cache: !isDev,
})

app.engine('liquid', liquid.express())
app.set('views', join(projectRoot, 'views'))
app.set('view engine', 'liquid')

app.use(express.static(join(projectRoot, 'public')))

// Used by setup.sh to decide when the server is actually ready.
app.get('/healthz', (_req, res) => {
  res.type('text/plain').send('ok')
})

app.get('/', (_req, res) => {
  res.render('index', {
    dev: isDev,
    nodeVersion: process.version,
    bootTime,
  })
})

if (isDev) {
  const { attachDevReload } = await import('./dev-reload.ts')
  await attachDevReload(app, { projectRoot, bootId })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`\n  htmx-vassning-lab  ->  http://localhost:${port}\n`)
})
