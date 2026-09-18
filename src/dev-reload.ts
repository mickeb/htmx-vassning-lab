import { join } from 'node:path'
import type { Express, Response } from 'express'

interface DevReloadOptions {
  projectRoot: string
  bootId: string
}

/**
 * Development-only live reload.
 *
 * Holds an SSE connection open per browser tab and pushes a "reload" event when
 * anything under views/ or public/ changes. Server-side code changes are handled
 * separately: nodemon restarts the process, the browser's EventSource
 * reconnects on its own, and the changed boot id tells it the page is stale.
 */
export async function attachDevReload(
  app: Express,
  { projectRoot, bootId }: DevReloadOptions,
): Promise<void> {
  // chokidar is a devDependency, so it is imported lazily -- a production
  // install without dev dependencies must still be able to boot.
  const { watch } = await import('chokidar')

  const clients = new Set<Response>()

  app.get('/__reload', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Stops proxies from buffering the stream and delaying events.
      'X-Accel-Buffering': 'no',
    })
    res.write(`event: hello\ndata: ${bootId}\n\n`)

    clients.add(res)
    req.on('close', () => {
      clients.delete(res)
    })
  })

  // Editors often write a file in several steps, which would otherwise fire
  // multiple reloads for one save.
  let pending: ReturnType<typeof setTimeout> | undefined
  const scheduleReload = (): void => {
    clearTimeout(pending)
    pending = setTimeout(() => {
      for (const client of clients) {
        client.write('event: reload\ndata: 1\n\n')
      }
    }, 100)
  }

  watch([join(projectRoot, 'views'), join(projectRoot, 'public')], {
    // Filesystem events do not travel reliably across a Docker bind mount on
    // macOS. Polling a tree this small costs nothing and always works.
    usePolling: true,
    interval: 300,
    ignoreInitial: true,
  }).on('all', scheduleReload)

  console.log('  hot reload: watching views/ and public/ (polling)')
}
