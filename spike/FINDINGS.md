# KISS Spike Findings

> **KISS** — Keep It Simple Stack: AI-powered platform that generates and deploys full-stack RedwoodSDK apps to Cloudflare.

## TL;DR

| Spike | Question | Result | Confidence |
|-------|----------|--------|------------|
| 1. Code Generation | Can Claude generate valid rwsdk code? | **YES** — 3/3 apps built first try | HIGH |
| 2. Deployment | Can we deploy to Cloudflare programmatically? | **YES** — Workers + D1 via API work | HIGH |
| 3. GitHub APIs | Can we manage repos/PRs programmatically? | **YES** — Full lifecycle works, Copilot optional | HIGH |

**Bottom line: KISS is viable.** All three unknowns are validated. An MVP can be built using Claude API for generation, Cloudflare Workers API for deployment, and GitHub APIs for the git workflow.

---

## Spike 1: Code Generation (findings-codegen.md)

### What We Tested
- Created a ~15KB system prompt teaching Claude rwsdk patterns (routing, RSC, D1, Tailwind)
- Generated 3 apps via Claude Sonnet API: counter (client state), todo (D1 + mutations), blog (D1 + multi-page)
- Attempted `npm install` + `vite build` on each

### Results
| App | Files | Build | Notes |
|-----|-------|-------|-------|
| Counter | 10 | PASS | useState, "use client", Tailwind |
| Todo | 14 | PASS | D1 CRUD, "use server", form actions |
| Blog | 16 | PASS | Multi-route, dynamic params, admin page |

### Key Findings
- **All 3 apps compiled on first attempt** — no manual fixes needed
- Generation takes ~10-15 seconds per app (Sonnet)
- The **system prompt is the key lever** — model output quality tracks prompt quality directly
- rwsdk publishes `llms-full.txt` (314KB) which can be used for prompt refinement
- Sonnet is the right model choice: fast, cheap, good enough quality

### What Still Needs Testing
- Deploying generated builds to live Cloudflare Workers (build outputs look correct but untested end-to-end)
- More complex app patterns: auth, file uploads, realtime, multiple DB tables
- Error recovery: what happens when generation produces broken code? Can a follow-up prompt fix it?

---

## Spike 2: Deployment (findings-deploy.md)

### What We Tested
- Workers for Platforms (dispatch namespaces)
- Regular Worker deployment via API
- D1 database provisioning + schema execution
- Worker ↔ D1 binding
- Workers.dev subdomain activation
- Resource cleanup (delete worker + D1)

### Results
| Capability | Status | Notes |
|------------|--------|-------|
| Workers for Platforms | NOT AVAILABLE | Requires paid add-on ($25/mo), tested on 2 accounts |
| Worker deploy (multipart PUT) | WORKS | ES module format, ~1s deploy time |
| D1 create | WORKS | Requires D1:Edit token scope |
| D1 SQL execution | WORKS | `datetime('now')` default fails in D1; handle in app code |
| Worker + D1 binding | WORKS | Via metadata in multipart upload |
| Workers.dev subdomain | WORKS | `POST /workers/scripts/{name}/subdomain` |
| Worker delete | WORKS | Clean deletion via DELETE API |
| D1 delete | WORKS | Clean deletion via DELETE API |

### Key Findings
- **Regular Workers are sufficient for MVP** — no need for Workers for Platforms
- Worker upload format is fussy: part name must match `main_module` in metadata, content-type must be `application/javascript+module`
- D1 doesn't support function defaults like `datetime('now')` — generate timestamps in application code
- Each preview gets its own Worker + D1 database, named by convention (e.g., `kiss-preview-{uuid}`)
- Cleanup is straightforward: DELETE both resources
- Live URL pattern: `https://{worker-name}.{subdomain}.workers.dev`

### Working Deploy Sequence
```
1. POST /d1/database                     → Create D1 database
2. POST /d1/database/{id}/query          → Run schema SQL
3. PUT  /workers/scripts/{name}          → Upload Worker (multipart, with D1 binding)
4. POST /workers/scripts/{name}/subdomain → Enable workers.dev route
5. GET  https://{name}.{sub}.workers.dev → Verify live
```

### Cost (MVP)
| Component | Free Tier | Paid |
|-----------|-----------|------|
| Workers | 100K req/day | $5/mo + $0.30/M |
| D1 | 5M reads/day | $0.75/M reads |
| Claude API (Sonnet) | — | ~$0.01-0.05/generation |

---

## Spike 3: GitHub APIs & Copilot (findings-github.md)

### What We Tested
- Template repo creation + generation from template
- Full PR lifecycle: create branch → push files → open PR → comment → close
- Issue management: create, assign, comment, close
- Copilot coding agent assignment

### Results
| Operation | Status | Notes |
|-----------|--------|-------|
| Create/generate from template | WORKS | Full repo cloned from template |
| Create branch + push files | WORKS | Via Git refs + Contents API |
| Open/close PRs | WORKS | Full lifecycle |
| Create/comment on issues | WORKS | For iteration workflow |
| Assign Copilot to issue | NOT TESTED | Requires Copilot Pro+ plan |

### Key Findings
- **Standard GitHub APIs cover the entire KISS workflow** — no Copilot-specific APIs needed
- Template repos work perfectly for project scaffolding
- For pushing many files, Git Data API (trees + commits) is more efficient than Contents API (one file per request)
- Copilot is optional: adds iteration via issue assignment but with 10-30min latency and $39/mo cost
- Fine-grained PATs with repo-level scoping work well for security

### KISS Git Workflow
```
1. POST /repos/{template}/generate       → Create user's repo
2. POST /repos/{repo}/git/refs           → Create branch
3. PUT  /repos/{repo}/contents/{file}    → Push generated code
4. POST /repos/{repo}/pulls              → Open PR
5. POST /repos/{repo}/issues/{n}/comments → Add instructions
```

---

## Recommended MVP Architecture

```
User → KISS UI → Claude API (generate code) → GitHub API (repo + PR)
                                              → Cloudflare API (deploy)
                                                ├── Worker (app)
                                                └── D1 (database)
```

### Components
1. **KISS Frontend**: Form to describe the app, shows preview URL + GitHub repo
2. **KISS Backend**: Orchestrator that calls Claude API + GitHub API + Cloudflare API
3. **System Prompt**: Curated rwsdk reference (~15KB), maintained as rwsdk evolves
4. **Template Repo**: rwsdk skeleton (package.json, vite config, tsconfig, etc.)
5. **Preview Workers**: One per generated app, auto-named, with D1 binding
6. **Cleanup Job**: TTL-based deletion of old previews + repos

### Flow
1. User describes app in natural language
2. Backend sends prompt to Claude Sonnet with rwsdk system prompt
3. Claude returns JSON with file array
4. Backend creates GitHub repo from template, pushes generated code, opens PR
5. Backend runs `npm install && vite build` (in build environment)
6. Backend uploads Worker bundle + creates D1 + runs schema via Cloudflare API
7. Returns live preview URL + GitHub repo link to user
8. User iterates by describing changes → new Claude call → new PR

### Open Questions for MVP
1. **Build environment**: Where does `npm install && vite build` run? Options: server-side (Lambda/container), Cloudflare Worker (limited), GitHub Actions
2. **Iteration**: How does the user request changes? Re-generate from scratch, or diff-based editing?
3. **Auth/rate limiting**: How to prevent abuse of generation + deployment?
4. **Asset handling**: rwsdk builds produce static assets — how to upload alongside Worker?
5. **Custom domains**: Workers.dev URLs are fine for preview, but production needs custom domains

---

## Files in This Spike

```
spike/
├── FINDINGS.md                          ← This file
├── findings-codegen.md                  ← Spike 1 detailed findings
├── findings-deploy.md                   ← Spike 2 detailed findings
├── findings-github.md                   ← Spike 3 detailed findings
├── rwsdk-system-prompt.txt              ← System prompt for code generation
├── rwsdk-llms-full.txt                  ← Official rwsdk LLM reference (314KB)
├── rwsdk-llms.txt                       ← Official rwsdk LLM reference (short)
└── generated/
    ├── hello-counter/                   ← Generated counter app (builds ✓)
    ├── todo-d1/                         ← Generated todo app with D1 (builds ✓)
    └── blog-d1/                         ← Generated blog app with D1 (builds ✓)
```
