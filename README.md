# ReactToDo

[![CI](https://github.com/elQuirio/ToDoApp/actions/workflows/test.yml/badge.svg)](https://github.com/elQuirio/ToDoApp/actions/workflows/test.yml)
![Last Commit](https://img.shields.io/github/last-commit/elQuirio/ToDoApp)

A full-stack todo application with user authentication, persistent preferences,
drag-and-drop reordering, and an integrated LLM-powered chat assistant.

Built as a portfolio project to practice the full React + Node stack end-to-end:
state management, REST API design, JWT auth, and external API integration.

https://github.com/user-attachments/assets/0d5dd96f-59f3-4fdc-9a4b-7b9c82c0dcc0

## Features

- **Authentication** — register / login / logout with JWT (bcrypt-hashed passwords).
- **Todos** — create, inline-edit, mark active/completed, bulk mark-all,
  bulk delete (all or completed only).
- **Sorting** — manual drag-and-drop, by creation date, last update, or
  alphabetical, ascending or descending.
- **Per-user preferences** — sort, view filter (all / active / completed),
  light/dark theme, default view (todos / chat) — persisted server-side.
- **Due dates** — date picker powered by Flatpickr.
- **Chat assistant** — chat with an LLM about your todos, with persistent
  conversation history per user (OpenAI Responses API).
- **Theme** — light and dark mode.

## Tech stack

**Frontend**
- React + Vite
- Redux Toolkit (slices, thunks, selectors)
- Floating UI, Flatpickr, Lucide icons
- Vanilla CSS (custom styling, no framework)

**Backend**
- Node.js + Express
- JWT auth (`jsonwebtoken`) + `bcrypt`
- JSON-file persistence (custom `db.js` data layer)
- OpenAI Responses API for chat (`gpt-4.1-nano`)

**Tests**
- Jest + Supertest for backend (auth routes, DB helpers)

## Project structure

```
ReactToDo/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── app/             # store + root App
│       ├── components/      # presentational + container components
│       ├── slices/          # Redux slices
│       ├── thunks/          # async action creators
│       ├── selectors/       # memoized selectors
│       ├── hooks/           # custom hooks
│       └── config/          # API base URL config
└── server/                  # Express backend
    ├── app.js               # routes + middleware
    ├── db.js                # JSON-file data layer
    ├── services/            # chat service + LLM client
    ├── utils/               # auth helpers (sign/verify JWT)
    ├── tests/               # Jest + Supertest
    └── src/assets/          # JSON "DB" files (runtime data)
```

## Getting started

### Prerequisites
- Node.js 20+
- An OpenAI API key (only required for the chat feature)

### 1. Clone and install

```bash
git clone https://github.com/elQuirio/ToDoApp.git
cd ToDoApp

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/dev.env` from the example:

```bash
cp server/.env.example server/dev.env
```

Then fill in:
- `JWT_SECRET` — any strong random string in dev, a real secret in prod.
- `OPENAI_API_KEY` — only needed if you want the chat feature.

### 3. Run

In two terminals:

```bash
# terminal 1 — backend (port 3000)
cd server && npm run dev

# terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open <http://localhost:5173>.

## API

All `/api/todos`, `/api/preferences`, `/api/chat` routes require an
`Authorization: Bearer <token>` header.

| Method | Path                          | Purpose                           |
|--------|-------------------------------|-----------------------------------|
| POST   | `/api/auth/register`          | Create user, returns JWT          |
| POST   | `/api/auth/login`             | Login, returns JWT                |
| GET    | `/api/auth/checkAuth`         | Validate token                    |
| POST   | `/api/auth/logout`            | Logout (client-side discard)      |
| GET    | `/api/todos`                  | List user's todos                 |
| POST   | `/api/todos`                  | Create todo                       |
| PATCH  | `/api/todos/:id`              | Update todo                       |
| PATCH  | `/api/todos/resort`           | Re-sort by criteria               |
| PATCH  | `/api/todos/reorder`          | Manual drag-and-drop reorder      |
| PATCH  | `/api/todos/mark-all/:status` | Bulk mark active/completed        |
| DELETE | `/api/todos?status=...`       | Bulk delete (all or completed)    |
| GET    | `/api/preferences`            | Get user preferences              |
| PATCH  | `/api/preferences`            | Update preferences                |
| GET    | `/api/chat/messages`          | List chat history                 |
| POST   | `/api/chat/messages`          | Send message, get assistant reply |

## Tests

```bash
cd server && npm test
```
