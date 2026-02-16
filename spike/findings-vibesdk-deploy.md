# Spike 1: VibeSDK Deployment Findings

## Summary

Researched VibeSDK's architecture in depth via the GitHub repository. **Did not deploy** (requires Workers Paid plan + custom domain + Containers subscription), but mapped the full architecture and identified all customization points for an rwsdk fork.

## VibeSDK Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 19 + Vite + TailwindCSS | Chat UI, file viewer, preview |
| Backend | Cloudflare Worker + Durable Objects | AI agent, session management |
| AI | Multi-provider via AI Gateway | Code generation (Gemini default) |
| Sandbox | Cloudflare Containers (Docker) | Live preview of generated apps |
| Database | D1 (Drizzle ORM) | Users, apps, sessions, analytics |
| Templates | R2 bucket | Starter templates (ZIP files) |
| Sessions | KV namespace | Session/cache storage |
| Deploy | Workers for Platforms | Production deployment of user apps |
| Auth | Google/GitHub OAuth + JWT | User authentication |

### Key Files

| File | Purpose |
|------|---------|
| `worker/index.ts` | Main worker entry (7860 lines) |
| `worker/agents/` | Agent system (88 files) |
| `worker/agents/operations/prompts/agenticBuilderPrompts.ts` | **Main AI system prompt** (~500 lines) |
| `worker/agents/operations/UserConversationProcessor.ts` | Chat-facing AI ("Orange") |
| `worker/agents/inferutils/config.ts` | LLM model configuration |
| `worker/agents/planning/templateSelector.ts` | AI template selection |
| `worker/agents/planning/blueprint.ts` | Project blueprint generation |
| `worker/agents/prompts.ts` | Shared prompt utilities |
| `worker/agents/utils/templates.ts` | Scratch template generator |

### Agent Flow

```
User message (WebSocket/PartySocket)
  → CodeGeneratorAgent Durable Object
    → "Orange" Conversation Processor (chat-facing AI)
      → queue_request tool → Builder Agent
        → init_suitable_template()    — picks template from R2
        → generate_blueprint()        — creates project plan/PRD
        → generate_files()            — writes code to Virtual FS
        → deploy_preview()            — syncs to Sandbox container
        → run_analysis()              — TypeScript + ESLint checking
        → git commit                  — saves to isomorphic-git in DO SQLite
        → mark_generation_complete()
```

### State Machine
`IDLE → PHASE_GENERATING → PHASE_IMPLEMENTING → REVIEWING → IDLE`

### Two-Filesystem Architecture
- **Virtual FS**: Persistent in Durable Object storage + git history
- **Sandbox FS**: Ephemeral Docker container (bun + Vite dev server), synced via `deploy_preview`

## LLM Provider Configuration

VibeSDK supports multiple LLM providers via Cloudflare AI Gateway:

| Provider | Models Available |
|----------|----------------|
| Google AI Studio | Gemini 2.5 Pro/Flash/Flash-Lite, Gemini 3 Pro/Flash Preview |
| Anthropic | Claude 3.7 Sonnet, Claude 4 Sonnet, Claude 4.5 Sonnet/Opus/Haiku |
| OpenAI | GPT-5, GPT-5.1, GPT-5.2, GPT-5 Mini |
| Grok | Grok Code Fast 1, Grok 4 Fast, Grok 4.1 Fast |
| Google Vertex AI | Various open-source models |

**Default config** (self-hosted): All Gemini (3 Flash Preview for generation, 2.5 Flash for chat)
**Platform config** (build.cloudflare.dev): Mix of Gemini 3 + Grok 4.1

**To switch to Claude**: Change model names in `worker/agents/inferutils/config.ts` `AGENT_CONFIG` object.

## Cloudflare Bindings Required

| Binding | Type | Paid Feature |
|---------|------|-------------|
| AI | Workers AI | Free tier available |
| DISPATCHER | WfP dispatch namespace | $25/mo add-on |
| DB | D1 database | Free tier (5M reads/day) |
| TEMPLATES_BUCKET | R2 bucket | Free tier (10GB) |
| VibecoderStore | KV namespace | Free tier available |
| CodeGenObject | Durable Object | Workers Paid ($5/mo) |
| Sandbox | DO + Containers | Workers Paid + Containers |
| DORateLimitStore | Durable Object | Workers Paid |
| UserSecretsStore | Durable Object | Workers Paid |
| ASSETS | Static assets | Free |

### Minimum Cost to Run

| Component | Cost |
|-----------|------|
| Workers Paid plan | $5/month |
| Workers for Platforms | $25/month |
| Containers | Pricing varies (vCPU/RAM/disk) |
| Advanced Certificate Manager | ~$10/month (for custom domain) |
| AI API costs | ~$0.01-0.10/generation (depends on provider) |
| **Estimated minimum** | **~$40-50/month** |

## Customization Points for rwsdk Fork

To make VibeSDK generate rwsdk apps instead of generic React/Vite apps:

### 1. Agent System Prompt (HIGH PRIORITY)
**File**: `worker/agents/operations/prompts/agenticBuilderPrompts.ts`
- Replace `<critical_rules>` section with rwsdk architecture constraints
- Modify `<architecture>` to describe RSC, defineApp(), "use client"/"use server"
- Update `<workflow>` for rwsdk build process
- Adjust `<quality_standards>` for rwsdk patterns

### 2. Template Selection
**File**: `worker/agents/planning/templateSelector.ts`
- Add rwsdk project type classification
- Update template selection logic to prefer rwsdk template for full-stack requests

### 3. Blueprint Generation
**File**: `worker/agents/planning/blueprint.ts`
- Modify `PHASIC_SYSTEM_PROMPT` to plan for RSC architecture
- Adjust phase structure for rwsdk's server-first model

### 4. Scratch Template
**File**: `worker/agents/utils/templates.ts`
- Replace fallback Vite+React starter with rwsdk starter
- Update `vite.config.ts` template to `vite.config.mts` with rwsdk plugins

### 5. LLM Config
**File**: `worker/agents/inferutils/config.ts`
- Swap default models from Gemini to Claude (e.g., `anthropic/claude-sonnet-4-20250514`)

### 6. Conversation Agent
**File**: `worker/agents/operations/UserConversationProcessor.ts`
- Update "Orange" personality to understand rwsdk context

### 7. Shared Prompt Utilities
**File**: `worker/agents/prompts.ts`
- Add rwsdk-specific style/use-case instructions
- Update `generalSystemPromptBuilder` with rwsdk patterns

### 8. Templates Repository
- Add `reference/rwsdk-reference/` and `definitions/rwsdk-basic/` to vibesdk-templates
- Upload to R2 bucket
- Update `template_catalog.json`

## Assessment

### Is VibeSDK a viable foundation to fork?

**YES, with caveats:**

**Pros:**
- Comprehensive platform (auth, sessions, previews, deployment, git history)
- Clean template system designed for extension
- Multi-provider LLM support (Claude already supported)
- Open source MIT license
- 614 commits, active development

**Cons:**
- Complex codebase (88 agent files, 7860-line worker/index.ts)
- Heavy Cloudflare dependency (Containers, WfP, D1, DO, R2, KV, AI Gateway)
- Expensive to run ($40-50/mo minimum)
- Agent prompts deeply tied to Hono + React Router patterns
- Would need ~8 files modified for rwsdk support

**Key decision**: The fork is viable but non-trivial. The alternative (building KISS as a simpler standalone tool using Claude API + CF API) might be faster to MVP but lacks the rich UX (live preview, file viewer, chat iteration) that VibeSDK provides.

## Deploy Prerequisites (for when ready)

1. Cloudflare Workers Paid plan ($5/mo)
2. Workers for Platforms subscription ($25/mo)
3. Containers access (may require Enterprise or waitlist)
4. Custom domain managed in Cloudflare
5. Google AI Studio API key (for Gemini default) OR Anthropic API key
6. JWT secret for auth
7. OAuth credentials (Google/GitHub) for user login
