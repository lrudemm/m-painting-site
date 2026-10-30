import Database from 'better-sqlite3';

// Opens (or creates) the SQLite database file in the project folder.
const db = new Database('paintings.db');

db.pragma('journal_mode = WAL');

// Create the table on startup if it does not exist yet.
db.exec(`
  CREATE TABLE IF NOT EXISTS paintings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    medium     TEXT    NOT NULL,
    width_in   REAL,
    height_in  REAL,
    price      REAL    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'available',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
