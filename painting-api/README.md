# Painting API

A REST API for the Meghan Rud ~ Painting gallery. It stores paintings in a SQLite database and provides full CRUD operations over HTTP.

**Resource:** `paintings`

| Field       | Type    | Notes                                              |
|-------------|---------|----------------------------------------------------|
| `id`        | integer | Auto-incrementing primary key                      |
| `title`     | text    | **Required**                                       |
| `medium`    | text    | **Required**, e.g. "Oil on canvas"                 |
| `width_in`  | real    | Optional, inches                                   |
| `height_in` | real    | Optional, inches                                   |
| `price`     | real    | **Required**, 0 or more                            |
| `status`    | text    | `available` (default) or `sold`                    |
| `created_at`| text    | Set automatically on insert                        |

## Setup

```bash
npm install
npm start
```

The server runs at `http://localhost:3000`. Set a different port with `PORT=4000 npm start`. The database file `paintings.db` is created automatically on first run.

## Endpoints

| Method   | Path                  | Success             | Errors               |
|----------|-----------------------|---------------------|----------------------|
| `GET`    | `/api/paintings`      | `200` list          | —                    |
| `GET`    | `/api/paintings/:id`  | `200` one painting  | `404` not found      |
| `POST`   | `/api/paintings`     | `201` created row   | `400` invalid data   |
| `PUT`    | `/api/paintings/:id`  | `200` updated row   | `400` invalid, `404` not found |
| `DELETE` | `/api/paintings/:id`  | `204` no content    | `404` not found      |

Malformed JSON returns `400`. Unknown routes return `404`.

## Sample requests

These examples assume the server is running on port 3000 and the database is empty at the start.

### List all paintings

```bash
curl -i http://localhost:3000/api/paintings
```

Response `200 OK`:

```json
[]
```

### Create a painting

```bash
curl -i -X POST http://localhost:3000/api/paintings \
  -H "Content-Type: application/json" \
  -d '{"title":"Low Tide at Jax Beach","medium":"Oil on canvas","width_in":16,"height_in":20,"price":650}'
```

Response `201 Created`:

```json
{"id":1,"title":"Low Tide at Jax Beach","medium":"Oil on canvas","width_in":16,"height_in":20,"price":650,"status":"available","created_at":"2026-10-26 10:01:05"}
```

### Get one painting

```bash
curl -i http://localhost:3000/api/paintings/1
```

Response `200 OK`: the painting object shown above.

### Update a painting

`PUT` replaces all fields, so send the full painting.

```bash
curl -i -X PUT http://localhost:3000/api/paintings/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Low Tide at Jax Beach","medium":"Oil on canvas","width_in":16,"height_in":20,"price":700,"status":"sold"}'
```

Response `200 OK`: the updated painting object, with `"price":700` and `"status":"sold"`.

### Delete a painting

```bash
curl -i -X DELETE http://localhost:3000/api/paintings/1
```

Response `204 No Content` with an empty body.

### Error examples

Missing required fields on create (`400 Bad Request`):

```bash
curl -i -X POST http://localhost:3000/api/paintings \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
```

```json
{"error":"Invalid painting data","details":["title is required and must be a non-empty string","medium is required and must be a non-empty string","price is required and must be a number of 0 or more"]}
```

Painting that does not exist (`404 Not Found`):

```bash
curl -i http://localhost:3000/api/paintings/999
```

```json
{"error":"Painting not found"}
```

## Implementation notes

- All database statements use `?` placeholders with bound values. No input is concatenated into SQL.
- Input is validated on `POST` and `PUT` before anything is written.
- Tested with `curl`: all five endpoints return the status codes listed above.
