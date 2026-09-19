import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

// Postgres runs as a second container; see compose.yaml. It is not published to
// the host, so nothing outside the compose network can reach it.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * Applies src/sql/schema.sql.
 *
 * Runs on every boot, which in this lab means every time a file under src/ is
 * saved and nodemon restarts the server. Every statement in that file is
 * therefore written to be safe to re-run -- CREATE TABLE IF NOT EXISTS and
 * friends. There is no migration table and nothing to keep in step.
 *
 * compose.yaml waits for the database to report healthy before starting the
 * server, but that only covers the first boot: restarting the database
 * mid-session leaves the server reconnecting on its own. Hence the retry.
 */
export async function migrate(): Promise<void> {
  const schema = await readFile(join(srcRoot, 'sql', 'schema.sql'), 'utf8')

  const attempts = 30
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await pool.query(schema)
      console.log('  database: schema applied')
      return
    } catch (error) {
      if (attempt === attempts) throw error
      if (attempt === 1) console.log('  database: waiting for Postgres to accept connections...')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

/** Used by /healthz, so "the server responds" cannot be true while the database is unreachable. */
export async function databaseReachable(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}
