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

  // Polling by default, because inotify events do not cross every host's
  // bind mount -- most notably Windows with the project on the Windows
  // filesystem rather than inside WSL2, and older Docker Desktop setups using
  // gRPC-FUSE. Native watching failing is a bad failure: the page still reports
  // hot reload as "connected" (the SSE stream is fine) while nothing reloads.
  //
  // The cost is latency, measured on macOS with VirtioFS: ~520ms mean and
  // jittery, against ~160ms and steady for native. Imperceptible for
  // save-and-look, and worth it for working everywhere.
  //
  // Set LAB_WATCH_POLL=false to use native watching instead.
  const usePolling = process.env.LAB_WATCH_POLL !== 'false'

  watch([join(projectRoot, 'views'), join(projectRoot, 'public')], {
    usePolling,
    interval: 300,
    ignoreInitial: true,
  }).on('all', scheduleReload)

  console.log(`  hot reload: watching views/ and public/ (${usePolling ? 'polling' : 'native'})`)
}
