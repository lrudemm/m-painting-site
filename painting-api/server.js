import express from 'express';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const STATUSES = ['available', 'sold'];

// ---------- Helpers ----------

// Returns a positive integer id from the URL, or null if it isn't one.
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Validates a painting payload. Returns an array of problems (empty = valid).
function validatePainting(body) {
  const errors = [];

  if (typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push('title is required and must be a non-empty string');
  }
  if (typeof body.medium !== 'string' || body.medium.trim() === '') {
    errors.push('medium is required and must be a non-empty string');
  }
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
    errors.push('price is required and must be a number of 0 or more');
  }
  if (body.width_in !== undefined && body.width_in !== null &&
      (typeof body.width_in !== 'number' || body.width_in <= 0)) {
    errors.push('width_in, if given, must be a positive number');
  }
  if (body.height_in !== undefined && body.height_in !== null &&
      (typeof body.height_in !== 'number' || body.height_in <= 0)) {
    errors.push('height_in, if given, must be a positive number');
  }
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push(`status, if given, must be one of: ${STATUSES.join(', ')}`);
  }

  return errors;
}

// ---------- Endpoints ----------

// List all paintings
app.get('/api/paintings', (req, res) => {
  const rows = db.prepare('SELECT * FROM paintings ORDER BY id').all();
  res.status(200).json(rows);
});

// Get one painting
app.get('/api/paintings/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: 'Painting not found' });
  }

  const row = db.prepare('SELECT * FROM paintings WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'Painting not found' });
  }
  res.status(200).json(row);
});

// Create a painting
app.post('/api/paintings', (req, res) => {
  const errors = validatePainting(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid painting data', details: errors });
  }

  const { title, medium, price, width_in = null, height_in = null, status = 'available' } = req.body;

  const result = db
    .prepare(`INSERT INTO paintings (title, medium, width_in, height_in, price, status)
              VALUES (?, ?, ?, ?, ?, ?)`)
    .run(title, medium, width_in, height_in, price, status);

  const created = db.prepare('SELECT * FROM paintings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Update (replace) a painting
app.put('/api/paintings/:id', (req, res) => {
  const id = parseId(req.params.id);
  const existing = id === null
    ? undefined
    : db.prepare('SELECT * FROM paintings WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Painting not found' });
  }

  const errors = validatePainting(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid painting data', details: errors });
  }

  const { title, medium, price, width_in = null, height_in = null, status = 'available' } = req.body;

  db.prepare(`UPDATE paintings
              SET title = ?, medium = ?, width_in = ?, height_in = ?, price = ?, status = ?
              WHERE id = ?`)
    .run(title, medium, width_in, height_in, price, status, id);

  const updated = db.prepare('SELECT * FROM paintings WHERE id = ?').get(id);
  res.status(200).json(updated);
});

// Delete a painting
app.delete('/api/paintings/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: 'Painting not found' });
  }

  const result = db.prepare('DELETE FROM paintings WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Painting not found' });
  }
  res.status(204).end();
});

// ---------- Error handling ----------

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Malformed JSON bodies and other unexpected errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Painting API running at http://localhost:${PORT}/api/paintings`);
});
