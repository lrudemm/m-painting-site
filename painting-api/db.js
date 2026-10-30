import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

// Opens (or creates) the SQLite database file in the project folder.
const db = new Database(path.join(here, 'paintings.db'));

db.pragma('journal_mode = WAL');
// SQLite ignores foreign keys unless this is switched on for each connection.
db.pragma('foreign_keys = ON');

// Build the tables from schema.sql. Every statement in it uses IF NOT EXISTS.
db.exec(readFileSync(path.join(here, 'schema.sql'), 'utf8'));

export default db;
