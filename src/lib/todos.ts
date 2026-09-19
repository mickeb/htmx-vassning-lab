import { pool } from './db.ts'

export type SortDirection = 'asc' | 'desc'

export interface Todo {
  id: number
  description: string
  complete: boolean
  created_at: Date
}

export interface TodoStats {
  total: number
  complete: number
}

/** Everything the list needs to render, whether as a full page or as a fragment. */
export interface ListModel {
  todos: Todo[]
  stats: TodoStats
  q: string
  sort: SortDirection
}

/**
 * Anything that is not "desc" sorts ascending.
 *
 * This matters more than it looks: the direction is the one part of the query
 * that cannot be a bound parameter, so it is interpolated into SQL. Letting a
 * caller decide what lands there would be an injection. Everything else in this
 * file is parameterised.
 */
export function normalizeSort(value: unknown): SortDirection {
  return value === 'desc' ? 'desc' : 'asc'
}

export async function list(q: string, sort: SortDirection): Promise<Todo[]> {
  const direction = sort === 'desc' ? 'DESC' : 'ASC'

  // id is the tiebreaker, so todos created in the same instant keep a stable
  // order instead of shuffling between requests.
  const { rows } = await pool.query<Todo>(
    `SELECT id, description, complete, created_at
       FROM todos
      WHERE $1 = '' OR description ILIKE '%' || $1 || '%'
      ORDER BY created_at ${direction}, id ${direction}`,
    [q],
  )
  return rows
}

export async function stats(): Promise<TodoStats> {
  const { rows } = await pool.query<{ total: string; complete: string }>(
    `SELECT count(*) AS total, count(*) FILTER (WHERE complete) AS complete FROM todos`,
  )
  const row = rows[0]
  return {
    total: Number(row?.total ?? 0),
    complete: Number(row?.complete ?? 0),
  }
}

/** The shared model behind both GET /todo-app and GET /todo-app/fragments/table. */
export async function listModel(q: string, sort: SortDirection): Promise<ListModel> {
  const [todos, counts] = await Promise.all([list(q, sort), stats()])
  return { todos, stats: counts, q, sort }
}

export async function add(description: string): Promise<Todo> {
  const { rows } = await pool.query<Todo>(
    `INSERT INTO todos (description) VALUES ($1)
     RETURNING id, description, complete, created_at`,
    [description],
  )
  const todo = rows[0]
  if (!todo) throw new Error('INSERT returned no row')
  return todo
}

/** Marks a todo complete. Completing is one-way; there is no un-complete. */
export async function complete(id: number): Promise<Todo | undefined> {
  const { rows } = await pool.query<Todo>(
    `UPDATE todos SET complete = true WHERE id = $1
     RETURNING id, description, complete, created_at`,
    [id],
  )
  return rows[0]
}

/** Behind a confirm() in the UI -- this deletes every todo, it does not reset them. */
export async function clearAll(): Promise<void> {
  await pool.query('DELETE FROM todos')
}
