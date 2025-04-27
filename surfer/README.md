# Surfer

Quick Fastify servers for toy applications. Start simple RESTful APIs with in-memory storage instantly!

## Installation

```bash
npm install -g surfer
```

## Usage

Start a toy application server:

```bash
npx surfer start <app-type> [options]
```

Available app types:
- `todolist`: A simple todo list API
- `notes`: A note-taking API (coming soon)
- `counter`: A counter API (coming soon)

Options:
- `-p, --port <port>`: Port to listen on (default: 3000)

## Example: Starting a Todo List Server

```bash
npx surfer start todolist
```

The server will start on http://localhost:3000 with the following endpoints:

- `POST /todos`: Create a new todo
- `GET /todos`: Get all todos
- `PUT /todos/:id`: Update a todo
- `DELETE /todos/:id`: Delete a todo

## Features

- Instant server startup
- In-memory storage
- RESTful endpoints
- Fastify-powered
- Zero configuration needed

## License

MIT 