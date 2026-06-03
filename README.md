# Todo App — Clean Architecture Sandbox

A minimal TypeScript todo app with no frontend framework. The point isn't the todo list — it's the shape of the code: how responsibilities split cleanly across a few small pieces, and how those pieces talk to each other without getting tangled.

---

## Structure

```
index.ts      → wires everything together, owns the DOM
app.ts        → orchestrates all user actions and decisions
todolist.ts   → renders the list and manages selection state
client.ts     → talks to the backend (json-server)
```

Each file has one job. None of them know more than they need to.

---

## How the pieces interact

`index.ts` is the entry point. It grabs DOM elements, builds each piece, and hands them to each other. After that, it steps back — it only forwards raw events (a keypress, a form submit) up to `App`.

`App` is the brain. It receives user intentions ("the input changed", "the form was submitted") and decides what to do: validate, call the server, update the list. It never touches the DOM directly — it talks to `Form` and `TodoList` through simple interfaces instead.

`TodoList` owns the rendered list. When `App` gives it fresh data, it redraws. When the user checks a box or clicks Done, it fires a callback upward — it doesn't act on its own, it just reports what happened.

`Client` wraps all the fetch calls. Nothing else in the app knows the API exists.

---

## Reactivity model

There's no reactive state library here. Reactivity is manual and deliberate:

- The server is the source of truth. After every write (add, done, delete), the app re-fetches the full list and re-renders from scratch.
- `TodoList` holds one piece of local state — the current checkbox selection — and updates the delete button immediately on each change, without a round-trip.
- Everything else flows in one direction: event → `App` → `Client` → re-render.

It's simple enough to trace with your eyes.

---

## Running it

```bash
# Start the backend
npx json-server --watch data.json --port 3000 # or npm run backend

# Start the frontend (Vite)
npm run dev
```

```bash
# Run the Playwright e2e tests
npx playwright test # or npm run pw
```
