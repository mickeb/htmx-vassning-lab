-- The whole database. Applied on every server boot, so every statement here
-- must be safe to run against a database that already has it -- the server
-- restarts whenever a file under src/ is saved.
--
-- There is no migration table and no seed data. The app starts empty on
-- purpose: attendees add their own todos and get a feel for it.

CREATE TABLE IF NOT EXISTS todos (
  id          integer     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  description text        NOT NULL,
  complete    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- The created_at column is sortable in the UI.
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos (created_at);
