# Spike 1: Code Generation Findings

## Summary

Tested Claude's ability to generate valid, buildable RedwoodSDK (rwsdk) apps using a custom system prompt. **All 3 test apps generated valid code that compiled successfully on the first attempt.** This is the strongest validation of the three spikes.

## Approach

1. Created a ~15KB system prompt (`rwsdk-system-prompt.txt`) distilling rwsdk patterns from:
   - Official starter template
   - kitchensink and billable example repos
   - rwsdk docs (routing, RSC, database, Tailwind)
2. Prompt instructs the model to output JSON `{files: [{path, content}]}` format
3. Used Claude Sonnet (claude-sonnet-4-20250514) via the Messages API
4. Tested 3 progressively complex prompts

## Test Results

### Test 1: Hello Counter (Client-Only State)

**Prompt**: "Build a simple counter app with increment/decrement buttons, useState, Tailwind CSS"

**Result: PASS** — Built successfully

- Generated 10 files (7 required + styles.css + Home.tsx + Counter.tsx)
- Correctly used `"use client"` for the Counter component
- Proper `useState` usage in client component
- Tailwind setup correct (plugin, `environments: { ssr: {} }`, `@import "tailwindcss"`, `?url` import)
- Build output: 333KB worker bundle, client bundle with Counter chunk

### Test 2: Todo App (D1 + Server Functions)

**Prompt**: "Build a todo app with D1 database — add, toggle, delete. Server functions for mutations. Tailwind CSS."

**Result: PASS** — Built successfully

- Generated 14 files (7 required + styles.css + Home.tsx + 3 components + functions.ts + migration SQL)
- Correctly used `"use server"` for functions.ts
- Proper `env.DB.prepare().bind().run()` D1 pattern
- Form actions with hidden inputs for toggle/delete mutations
- `"use client"` correctly applied to interactive components (AddTodoForm, TodoItem)
- Server component (TodoList) correctly fetches data with `env.DB`
- Build output: 337KB worker bundle, 3 client chunks

### Test 3: Blog App (D1 + Multi-Page Routing)

**Prompt**: "Build a blog with D1 — list posts, view single post, admin create page. Server functions. Tailwind CSS."

**Result: PASS** — Built successfully

- Generated 16 files (7 required + styles.css + 3 pages + 3 components + functions.ts + migration SQL)
- Correct multi-route setup: `route("/", Home)`, `route("/posts/:id", PostPage)`, `route("/admin", AdminPage)`
- Proper `params.id` usage in PostPage for dynamic routing
- Server component fetches posts with D1 prepared statements
- Client-only component for form (CreatePostForm) with `"use client"`
- Handles 404 case (post not found) correctly
- Build output: 340KB worker bundle, CreatePostForm client chunk

## Code Quality Assessment

**Patterns correctly followed:**
- `defineApp()` + `render(Document, [...routes])` in worker.tsx
- `"use client"` at file level for interactive components
- `"use server"` at file level for server functions
- `import { env } from "cloudflare:workers"` for D1 access
- D1 prepared statements with `.bind()` (no SQL injection)
- Form actions for mutations (RSC pattern)
- `?url` CSS import in Document
- `@/` path alias for src/
- `vite.config.mts` (correct extension)
- `initClient()` in client.tsx

**Minor observations:**
- The system prompt originally had `rwsdk@^0.0.0-experiments.87` (stale version). Fixed to `^1.0.0-beta.53`. The model dutifully used whatever version we specified — **the system prompt controls the output quality**.
- All apps used the simpler D1 direct SQL approach (as instructed) rather than Kysely/Durable Objects
- Generated SVG icons inline (checkmarks, X buttons) — reasonable for small apps

## Performance

| Metric | Counter | Todo | Blog |
|--------|---------|------|------|
| API response time | ~8s | ~12s | ~15s |
| Response size (chars) | 5,178 | 10,190 | 17,528 |
| Files generated | 10 | 14 | 16 |
| npm install | 15s | 16s | 16s |
| vite build | ~1.4s | ~1.4s | ~1.3s |
| Build success | Yes | Yes | Yes |

## Key Insight: System Prompt is the Lever

The model's output quality is directly tied to the system prompt quality. Our prompt:
- Provides exact file structure with real code examples
- Specifies version numbers, import paths, and patterns
- Explains framework-specific conventions (RSC defaults, "use client"/"use server")
- Defines the output format (JSON with files array)

**Recommendation**: Invest in the system prompt. Keep it updated as rwsdk evolves. The official `llms-full.txt` (314KB) from docs.rwsdk.com is too large for a system prompt but is a great source for distillation. The short `llms.txt` (483B) is just a pointer file. Our custom ~15KB prompt sits in the sweet spot.

## Assessment

**Code generation feasibility: HIGH**

- 3/3 apps built on first attempt
- Correct framework patterns in all cases
- Reasonable code structure and Tailwind styling
- ~10-15 second generation time is acceptable for a "preview" product
- Sonnet is fast and cheap enough for this use case

**For KISS specifically**: This validates the core value proposition. Claude can reliably generate buildable rwsdk apps from natural language descriptions, with the right system prompt.
