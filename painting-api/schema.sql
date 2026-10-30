-- Painting gallery schema
-- Two related tables: each inquiry may reference one painting.

CREATE TABLE IF NOT EXISTS paintings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  medium     TEXT    NOT NULL,
  width_in   REAL    CHECK (width_in IS NULL OR width_in > 0),
  height_in  REAL    CHECK (height_in IS NULL OR height_in > 0),
  price      REAL    NOT NULL CHECK (price >= 0),
  status     TEXT    NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'sold')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  painting_id INTEGER REFERENCES paintings(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_painting_id ON inquiries(painting_id);
