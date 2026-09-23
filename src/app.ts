import express from 'express'
import * as todos from './lib/todos.ts'

export const todoApp = express.Router()

todoApp.use(express.urlencoded({ extended: false }))

// --- reading the request -----------------------------------------------------

/** The search term and sort direction, from a query string or a form body. */
function listParams(source: Record<string, unknown>): { q: string; sort: todos.SortDirection } {
  return {
    q: typeof source['q'] === 'string' ? source['q'].trim() : '',
    sort: todos.normalizeSort(source['sort']),
  }
}

function description(source: Record<string, unknown>): string {
  return typeof source['description'] === 'string' ? source['description'].trim() : ''
}

function todoId(value: string | undefined): number | undefined {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

/**
 * Where to send the browser after a form post.
 *
 * The search term and sort direction ride along in the URL, so the list an
 * attendee was looking at is the list they land back on. The forms carry them
 * as hidden fields for exactly this reason.
 */
function listUrl(q: string, sort: todos.SortDirection): string {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (sort === 'desc') params.set('sort', sort)
  const query = params.toString()
  return query ? `/todo-app?${query}` : '/todo-app'
}

// --- full pages --------------------------------------------------------------

todoApp.get('/', async (req, res) => {
  // Uncomment to make this response take a second, for example to see a
  // loading indicator.
  // await new Promise((resolve) => setTimeout(resolve, 1000))

  const { q, sort } = listParams(req.query)
  const model = await todos.listModel(q, sort)
  res.render('todo-app/page', model)
})

todoApp.post('/todos', async (req, res) => {
  const { q, sort } = listParams(req.body)
  const text = description(req.body)

  // An empty description re-renders the page with the field marked. No message:
  // the red border is the whole error report.
  if (!text) {
    const model = await todos.listModel(q, sort)
    res.status(422).render('todo-app/page', { ...model, error: true })
    return
  }

  await todos.add(text)
  res.redirect(303, listUrl(q, sort))
})

todoApp.post('/todos/:id/complete', async (req, res) => {
  const { q, sort } = listParams(req.body)
  const id = todoId(req.params.id)
  if (id !== undefined) await todos.complete(id)
  res.redirect(303, listUrl(q, sort))
})

todoApp.post('/todos/clear', async (req, res) => {
  await todos.clearAll()
  res.redirect(303, '/todo-app')
})

// --- the same content, without the page around it ----------------------------

todoApp.get('/fragments/table', async (req, res) => {
  const { q, sort } = listParams(req.query)
  res.render('todo-app/todo-table', await todos.listModel(q, sort))
})

todoApp.get('/fragments/header', async (_req, res) => {
  res.render('todo-app/todo-header', { stats: await todos.stats() })
})

todoApp.post('/fragments/todos', async (req, res) => {
  const { q, sort } = listParams(req.body)
  const text = description(req.body)

  if (!text) {
    res.status(422).render('todo-app/new-todo-form', { q, sort, error: true })
    return
  }

  await todos.add(text)
  res.render('todo-app/add-response', await todos.listModel(q, sort))
})

todoApp.post('/fragments/todos/:id/complete', async (req, res) => {
  const { q, sort } = listParams(req.body)
  const id = todoId(req.params.id)
  const todo = id === undefined ? undefined : await todos.complete(id)

  if (!todo) {
    res.status(404).type('text/plain').send('No such todo')
    return
  }

  const stats = await todos.stats()
  res.render('todo-app/complete-response', { todo, q, sort, stats })
})

todoApp.post('/fragments/todos/clear', async (req, res) => {
  await todos.clearAll()
  const { q, sort } = listParams(req.body)
  res.render('todo-app/todo-table', await todos.listModel(q, sort))
})
