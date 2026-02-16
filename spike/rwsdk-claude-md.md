# RedwoodSDK (rwsdk) — Claude Code Guide

You are building apps with RedwoodSDK, a server-first React framework that runs exclusively on Cloudflare Workers. This guide contains everything you need to generate correct, buildable rwsdk code.

## Core Principles

- **Zero Magic**: No code generation, no special file names, only explicit imports/exports
- **Server-First**: All components are React Server Components by default
- **Cloudflare-Native**: Uses Workers, D1, R2, Durable Objects, KV — accessed via `import { env } from "cloudflare:workers"`

## Required File Structure

Every rwsdk project MUST have these 7 files:

### 1. `package.json`
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview",
    "release": "npm run build && wrangler deploy"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-server-dom-webpack": "^19.1.0",
    "rwsdk": "^1.0.0-beta.53"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1.0.6",
    "@cloudflare/workers-types": "^4.20250214.0",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "typescript": "^5.8.2",
    "vite": "^6.3.5",
    "wrangler": "^4.14.0"
  }
}
```

### 2. `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "main": "src/worker.tsx",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  }
}
```

When using D1 database, add:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "local"
    }
  ]
}
```

When using Durable Objects for database (advanced), add:
```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "DATABASE", "class_name": "DatabaseDO" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["DatabaseDO"] }
  ]
}
```

### 3. `vite.config.mts` (MUST be `.mts`, not `.ts`)
```typescript
import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
});
```

### 4. `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es2021",
    "lib": ["DOM", "DOM.Iterable", "ESNext", "ES2022"],
    "jsx": "react-jsx",
    "module": "es2022",
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "resolveJsonModule": true,
    "noEmit": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", ".tmp"]
}
```

### 5. `src/worker.tsx` — Application Entry Point
```typescript
import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";

export default defineApp([
  render(Document, [
    route("/", Home),
  ]),
]);
```

### 6. `src/client.tsx` — Client-Side Hydration
```typescript
import { initClient } from "rwsdk/client";
initClient();
```

### 7. `src/app/Document.tsx` — HTML Shell
```typescript
export const Document: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>My App</title>
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      {children}
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
```

## Routing

Routes are defined ONLY in `src/worker.tsx` using `defineApp()`.

### Basic Routes
```typescript
import { render, route, prefix } from "rwsdk/router";

export default defineApp([
  render(Document, [
    route("/", HomePage),
    route("/about", AboutPage),
    route("/posts/:id", PostPage),        // params.id available
    route("/files/*", FilesPage),          // params.$0 for wildcard
    prefix("/admin", [
      route("/", AdminDashboard),
      route("/posts", AdminPosts),
    ]),
  ]),
]);
```

### Route with Inline Handler (for data fetching)
```typescript
route("/posts/:id", async ({ params }) => {
  const post = await getPost(params.id);
  if (!post) return new Response("Not found", { status: 404 });
  return <PostPage post={post} />;
})
```

### HTTP Method Routing (API routes)
```typescript
route("/api/items", {
  get: () => Response.json(items),
  post: async ({ request }) => {
    const body = await request.json();
    return Response.json(newItem, { status: 201 });
  },
})
```

### Middleware (Interrupters)
```typescript
export default defineApp([
  // Global middleware
  async ({ ctx, request }) => {
    ctx.user = await getUser(request);
  },
  render(Document, [
    route("/", HomePage),
    route("/admin", [requireAuth, AdminPage]),  // Array = middleware chain
  ]),
]);
```

## React Server Components (RSC)

**ALL components are server components by default.** They:
- Run on the server only
- Can be `async` functions
- Can directly access databases, `env`, etc.
- CANNOT use `useState`, `useEffect`, event handlers (`onClick`, etc.)

```typescript
// Server component (default) — NO directive needed
export async function PostList() {
  const { results } = await env.DB.prepare("SELECT * FROM posts").all();
  return (
    <ul>
      {results.map((post: any) => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

### Client Components — `"use client"`
For interactivity, add `"use client"` at the TOP of the file (file-level, not component-level):

```typescript
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Server Functions — `"use server"`
For mutations called from client components. Mark the ENTIRE FILE:

```typescript
// src/app/functions.ts
"use server";

import { env } from "cloudflare:workers";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO todos (id, title, completed) VALUES (?, ?, 0)")
    .bind(id, title)
    .run();
}
```

Client components call server functions via form actions:
```typescript
"use client";

import { addTodo } from "./functions";

export function AddTodoForm() {
  return (
    <form action={addTodo}>
      <input type="text" name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}
```

### serverQuery and serverAction (advanced)

```typescript
"use server";

import { serverQuery, serverAction } from "rwsdk/worker";

// GET request, returns data only (no rehydration)
export const getTodos = serverQuery(async () => {
  const { results } = await env.DB.prepare("SELECT * FROM todos").all();
  return results;
});

// POST request, triggers page rehydration after mutation
export const deleteTodo = serverAction(async (id: string) => {
  await env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
});
```

## Database: D1 (Simple — Recommended for Generated Apps)

Use D1 with prepared statements for straightforward database access.

### Schema — `migrations/0001_init.sql`
```sql
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

**IMPORTANT:** Do NOT use `DEFAULT (datetime('now'))` in D1 schema — it fails. Generate timestamps in application code with `new Date().toISOString()`.

### Using D1 in Server Components
```typescript
import { env } from "cloudflare:workers";

export async function TodoList() {
  const { results } = await env.DB.prepare(
    "SELECT * FROM todos ORDER BY created_at DESC"
  ).all();
  return (
    <ul>
      {results.map((todo: any) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Using D1 in Server Functions
```typescript
"use server";

import { env } from "cloudflare:workers";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, 0, ?)"
  ).bind(id, title, new Date().toISOString()).run();
}

export async function toggleTodo(id: string, completed: boolean) {
  await env.DB.prepare("UPDATE todos SET completed = ? WHERE id = ?")
    .bind(completed ? 1 : 0, id).run();
}

export async function deleteTodo(id: string) {
  await env.DB.prepare("DELETE FROM todos WHERE id = ?").bind(id).run();
}
```

## Database: rwsdk/db with Kysely + Durable Objects (Advanced)

For type-safe database access with migrations:

### `src/db/migrations.ts`
```typescript
import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial": {
    async up(db) {
      return [
        await db.schema
          .createTable("todos")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("title", "text", (col) => col.notNull())
          .addColumn("completed", "integer", (col) => col.notNull().defaultTo(0))
          .addColumn("createdAt", "text", (col) => col.notNull())
          .execute(),
      ];
    },
    async down(db) {
      await db.schema.dropTable("todos").ifExists().execute();
    },
  },
} satisfies Migrations;
```

### `src/db/index.ts`
```typescript
import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";
import { type migrations } from "./migrations";

export type AppDatabase = Database<typeof migrations>;
export const db = createDb<AppDatabase>(env.DATABASE, "app-db");
```

### `src/db/durableObject.ts`
```typescript
import { SqliteDurableObject } from "rwsdk/db";
import { migrations } from "./migrations";

export class DatabaseDO extends SqliteDurableObject {
  migrations = migrations;
}
```

### Export from `src/worker.tsx`
```typescript
export { DatabaseDO } from "@/db/durableObject";
```

## Tailwind CSS Setup

### 1. Add dependencies to `package.json`
```json
{
  "dependencies": {
    "tailwindcss": "^4.1.0",
    "@tailwindcss/vite": "^4.1.0"
  }
}
```

### 2. Update `vite.config.mts`
```typescript
import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  environments: { ssr: {} },  // REQUIRED for Tailwind to work
  plugins: [
    cloudflare({ viteEnvironment: { name: "worker" } }),
    redwood(),
    tailwindcss(),
  ],
});
```

**CRITICAL:** The `environments: { ssr: {} }` stub is REQUIRED when using Tailwind. Without it, Tailwind silently fails.

### 3. Create `src/app/styles.css`
```css
@import "tailwindcss";
```

### 4. Import in `Document.tsx` with `?url` suffix
```typescript
import styles from "./styles.css?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>My App</title>
      <link rel="stylesheet" href={styles} />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      {children}
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
```

## Environment Variables

Access Cloudflare bindings via:
```typescript
import { env } from "cloudflare:workers";

// env.DB       — D1 database
// env.R2       — R2 bucket
// env.ASSETS   — static assets
// env.MY_VAR   — custom vars from wrangler.jsonc
```

**NEVER use `process.env`** — it doesn't exist in Cloudflare Workers.

## Common Patterns

### Passing Server Data to Client Components
Server components fetch data, client components receive it as props:
```typescript
// Server component
export async function TodoPage() {
  const { results } = await env.DB.prepare("SELECT * FROM todos").all();
  return <TodoList todos={results} />;
}

// Client component
"use client";
export function TodoList({ todos }: { todos: any[] }) {
  const [items, setItems] = useState(todos);
  // ... interactive UI
}
```

### Form Actions for Mutations
Use hidden inputs to pass data with form actions:
```typescript
"use client";

export function TodoItem({ todo }: { todo: any }) {
  return (
    <div>
      <span>{todo.title}</span>
      <form action={toggleTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={todo.completed ? "0" : "1"} />
        <button type="submit">{todo.completed ? "Undo" : "Done"}</button>
      </form>
    </div>
  );
}
```

### Redirects from Server Functions
```typescript
"use server";

export async function createPost(formData: FormData) {
  const id = crypto.randomUUID();
  // ... insert into DB
  return Response.redirect(`/posts/${id}`, 303);
}
```

## Key Rules (MUST Follow)

1. **ALL components are server components by default** — they run on the server
2. **`"use client"` goes at the FILE level**, not component level — the entire file becomes a client module
3. **`"use server"` goes at the FILE level** for server function files
4. **Document MUST include** `<script>import("/src/client.tsx")</script>`
5. **Routes are defined ONLY in** `src/worker.tsx` using `defineApp()`
6. **Use `import { env } from "cloudflare:workers"`** for env bindings, NEVER `process.env`
7. **Vite config extension is `.mts`** (not `.ts`)
8. **Use `@/` path alias** for `src/` directory imports
9. **Use `database_id: "local"`** in wrangler.jsonc for local D1 development
10. **Generate timestamps in code** with `new Date().toISOString()`, not SQL defaults
11. **CSS imports use `?url` suffix** in Document: `import styles from "./styles.css?url"`
12. **Tailwind requires `environments: { ssr: {} }`** in vite.config.mts

## Build & Test

```bash
# Install dependencies
npm install

# Build (validates everything compiles)
npx vite build

# Local development
npx vite dev

# Deploy to Cloudflare
npm run release
```

If the build fails, read the error carefully. Common issues:
- Missing `"use client"` on components using hooks/event handlers
- Wrong vite config extension (must be `.mts`)
- Missing `environments: { ssr: {} }` when using Tailwind
- Using `process.env` instead of `import { env } from "cloudflare:workers"`
- Importing server-only code in client components
