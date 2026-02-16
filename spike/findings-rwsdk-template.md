# Spike 2: rwsdk Template for VibeSDK Findings

## Summary

Studied VibeSDK's template system in depth and created a complete rwsdk template reference that fits into the system. **The template system can fully accommodate rwsdk, but requires a new base reference** (not an overlay on `vite-reference`) because rwsdk has a fundamentally different architecture.

## VibeSDK Template System Architecture

### How It Works

Templates are built from three layers:

1. **Base Reference** (`reference/<name>/`) — A complete, buildable starter app
2. **YAML Definition** (`definitions/<name>.yaml`) — Config: base reference, package patches, excludes, file patches
3. **Overlay Directory** (`definitions/<name>/`) — Files that overwrite the base reference

Generation flow: copy base reference → merge package.json patches → copy overlay files → apply excludes → apply file patches → verify build.

### Existing Templates

| Template | Base | Complexity | Key Features |
|----------|------|-----------|--------------|
| c-code-react-runner | vite-reference | Minimal | Just prompts/ + bun.lock |
| vite-cf-DO-runner | vite-reference | Medium | Durable Object patterns |
| vite-cf-DO-v2-runner | vite-reference | Medium | DO v2 + shared types |
| vite-cfagents-runner | vite-reference | Heavy | Full agent framework (11 worker files) |
| minimal-js | minimal-js-ref | Minimal | Bare JS starter |

All existing templates share `vite-reference` as the base — a Hono + React Router + shadcn/ui SPA.

### Required Files for Every Template

Every template **must** include:
- `prompts/selection.md` — When to select this template (for AI agent)
- `prompts/usage.md` — How to use this template (coding guide for AI)

These are embedded into `template_catalog.json` and consumed by the VibeSDK agent.

## Why rwsdk Needs Its Own Base Reference

| Dimension | vite-reference | rwsdk-reference |
|-----------|---------------|-----------------|
| **Entry point** | `worker/index.ts` (Hono) | `src/worker.tsx` (defineApp) |
| **Routing** | React Router (client-side) | rwsdk/router (server-side) |
| **Rendering** | Client-side SPA | React Server Components |
| **Components** | shadcn/ui + React Router | RSC default, "use client" explicit |
| **Build** | Standard Vite | rwsdk/vite + @cloudflare/vite-plugin |
| **Config** | `vite.config.ts` | `vite.config.mts` (MUST be .mts) |
| **Database** | DO via core-utils library | D1 via env.DB prepared statements |
| **Server functions** | Hono API routes | "use server" + form actions |

The differences are too fundamental for an overlay approach. An rwsdk template overlaying vite-reference would need to replace virtually every file.

## Created Artifacts

### `rwsdk-reference/` — Base Reference Template

```
rwsdk-reference/
├── package.json              # rwsdk + react + tailwind deps
├── wrangler.jsonc            # CF Worker config with D1 binding
├── vite.config.mts           # rwsdk/vite + @cloudflare/vite-plugin + tailwindcss
├── tsconfig.json             # TypeScript config with @/ path alias
├── src/
│   ├── worker.tsx            # defineApp() with routes
│   ├── client.tsx            # initClient()
│   └── app/
│       ├── Document.tsx      # HTML shell with Tailwind + client.tsx
│       ├── styles.css        # @import "tailwindcss"
│       └── pages/
│           └── Home.tsx      # Default home page
├── migrations/
│   └── 0001_init.sql         # Placeholder D1 schema
└── prompts/
    ├── selection.md          # When to use this template
    └── usage.md              # How to use this template (rwsdk CLAUDE.md content)
```

**Build status: PASS** — `npm install && npx vite build` succeeds.

### `rwsdk-basic.yaml` — Template Definition

```yaml
name: "rwsdk-basic"
description: "Full-stack RedwoodSDK app with React Server Components and D1 database"
base_reference: "rwsdk-reference"
projectType: app
package_patches:
  name: "rwsdk-basic"
```

Minimal definition because the base reference already contains everything needed.

### Template Prompts

**`prompts/selection.md`** — When to use:
- User wants server-first React with RSC
- User needs D1 database
- User asks for full-stack Cloudflare Workers app
- User mentions RedwoodSDK / rwsdk

**`prompts/usage.md`** — Coding guide:
- Complete file structure
- Routing patterns (defineApp, route, prefix)
- RSC patterns (server default, "use client", "use server")
- D1 patterns (prepared statements, migrations)
- Critical rules (12 rules covering common mistakes)
- ~4KB of distilled rwsdk knowledge

## Integration with VibeSDK

### What's Needed to Integrate

1. **Add to vibesdk-templates repo:**
   - Copy `rwsdk-reference/` to `reference/rwsdk-reference/`
   - Copy `rwsdk-basic.yaml` to `definitions/rwsdk-basic.yaml`
   - Create `definitions/rwsdk-basic/` overlay (can be just `prompts/` if base is sufficient)

2. **Generate and upload:**
   ```bash
   python3 tools/generate_templates.py -t rwsdk-basic
   python3 generate_template_catalog.py --output template_catalog.json
   bash deploy_templates.sh  # uploads to R2
   ```

3. **VibeSDK agent changes (for fork):**
   - Update template selector to understand rwsdk project type
   - Modify blueprint generation to plan for RSC architecture
   - Adjust agentic builder system prompt with rwsdk constraints

### Not Yet Tested

- Template catalog generation (requires Python tools from vibesdk-templates)
- R2 upload and VibeSDK platform integration
- AI agent template selection and code generation through VibeSDK pipeline

## Assessment

**Template system can accommodate rwsdk: YES**

The template system is explicitly designed for adding new templates. The YAML definition + base reference + overlay pattern is clean and extensible. The main work is creating the base reference (done) and the prompts (done).

**Key insight:** The `prompts/usage.md` file IS the CLAUDE.md content. Whatever we put there is what the VibeSDK agent will use to generate code. The quality of code generation is directly tied to the quality of this file.
