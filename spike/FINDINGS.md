# KISS Spike v2 Findings

> **KISS** — Keep It Simple Stack: AI-powered platform that generates and deploys full-stack RedwoodSDK apps to Cloudflare. **v2 thesis:** Fork VibeSDK and add an rwsdk template + rwsdk-specific AI prompting.

## Summary

VibeSDK is a viable foundation for KISS. Claude generates buildable rwsdk code with 100% success rate (3/3 apps, zero fixes needed). The VibeSDK template system cleanly accommodates rwsdk as a new base reference. The fork requires modifying ~8 files in the agent system. **Recommended path: Fork VibeSDK + add rwsdk template + swap to Claude.**

## Spike Results

### 1. VibeSDK Deployment
- **Deployed successfully?** Not attempted (requires $40-50/mo CF infrastructure)
- **Cost to run:** ~$40-50/month minimum (Workers Paid + WfP + Containers + domain)
- **Viable as foundation?** YES
- **Key architectural insight:** VibeSDK uses a multi-layer prompt system across ~8 files. The agent builder system prompt (`agenticBuilderPrompts.ts`) is the primary injection point for rwsdk patterns. LLM provider switching is already built in — Claude is a supported provider. Template selection is AI-driven using `prompts/selection.md` content from the template catalog.

### 2. rwsdk Template
- **Template builds?** YES — `npm install && npx vite build` passes cleanly
- **Integrates with VibeSDK?** Designed to fit — needs own base reference (not overlay on vite-reference)
- **Key blocker:** None. Template system is explicitly designed for new templates.

### 3. Claude Code Generation
- **Build success rate:** 3/3 (100%)
- **Self-correction needed:** 0/3 — all built on first attempt
- **Systematic issues:** None found
- **System prompt quality:** 9KB CLAUDE.md produces correct rwsdk code consistently

| Test | App | Complexity | Build | Self-Correction |
|------|-----|-----------|-------|-----------------|
| A | Hello World + About | Low (server-only) | PASS | Not needed |
| B | Todo with D1 | Medium (D1 + server functions + client components) | PASS | Not needed |
| C | Blog with D1 | High (multi-route + forms + D1) | PASS | Not needed |

## Recommended Architecture

Based on findings, the recommended path is:

**[X] Fork VibeSDK + add rwsdk template + swap to Claude**

This gives us:
- Rich UX out of the box (chat, file viewer, live preview, git history)
- AI agent with error correction, phased generation, blueprint planning
- Auth, sessions, deployment pipeline already built
- Template system designed for exactly this use case

The fork requires:
1. Add `rwsdk-reference` base template to vibesdk-templates
2. Add `rwsdk-basic` template definition with prompts/
3. Modify ~8 agent files to understand rwsdk patterns
4. Switch default LLM from Gemini to Claude
5. Deploy to own Cloudflare account

## Key Artifacts

| File | Description |
|------|-------------|
| `spike/rwsdk-claude-md.md` | The rwsdk CLAUDE.md — transferable to VibeSDK template `prompts/usage.md` |
| `spike/rwsdk-reference/` | Complete rwsdk base reference template (builds ✓) |
| `spike/rwsdk-reference/prompts/` | AI agent prompts: `selection.md` + `usage.md` |
| `spike/rwsdk-reference/rwsdk-basic.yaml` | VibeSDK template definition YAML |
| `spike/test-a/` | Generated Hello World app (builds ✓) |
| `spike/test-b/` | Generated Todo + D1 app (builds ✓) |
| `spike/test-c/` | Generated Blog + D1 app (builds ✓) |
| `spike/findings-codegen.md` | Spike 3 detailed findings |
| `spike/findings-rwsdk-template.md` | Spike 2 detailed findings |
| `spike/findings-vibesdk-deploy.md` | Spike 1 detailed findings |

## VibeSDK Fork: Files to Modify

| File | Change | Effort |
|------|--------|--------|
| `worker/agents/operations/prompts/agenticBuilderPrompts.ts` | Replace architecture rules with rwsdk patterns | High |
| `worker/agents/inferutils/config.ts` | Swap Gemini → Claude models | Low |
| `worker/agents/planning/templateSelector.ts` | Add rwsdk project type | Medium |
| `worker/agents/planning/blueprint.ts` | Adjust for RSC architecture | Medium |
| `worker/agents/utils/templates.ts` | Change scratch template to rwsdk | Medium |
| `worker/agents/operations/UserConversationProcessor.ts` | Update "Orange" for rwsdk context | Low |
| `worker/agents/prompts.ts` | Add rwsdk style/use-case instructions | Low |
| `wrangler.jsonc` | Update template repo URL, capabilities | Low |

## Comparison: Fork VibeSDK vs Build from Scratch

| Dimension | Fork VibeSDK | Build from Scratch |
|-----------|-------------|-------------------|
| Time to MVP | ~2-3 weeks (modify 8 files + deploy) | ~6-8 weeks (build platform) |
| UX quality | High (chat, preview, file viewer, git) | Basic (form + output) |
| Infrastructure | Complex ($40-50/mo, many CF services) | Simple ($10/mo, Workers + D1) |
| Maintenance | Track upstream changes | Full ownership |
| Agent quality | Battle-tested (614 commits, 3.3k stars) | From scratch |
| Flexibility | Constrained by VibeSDK architecture | Full control |

## Open Questions

1. **Containers access**: Do we have Cloudflare Containers enabled? (Required for live preview)
2. **Cost tolerance**: Is $40-50/mo acceptable for the platform infrastructure?
3. **Upstream tracking**: How do we stay in sync with VibeSDK upstream changes?
4. **Auth scope**: Do we need our own auth, or can we use VibeSDK's Google/GitHub OAuth as-is?
5. **More complex rwsdk patterns**: Tested D1 with direct SQL — need to test Durable Objects, auth, R2, queues
6. **Production deployment**: VibeSDK uses Workers for Platforms — do we need this or is workers.dev sufficient for MVP?
7. **Error recovery**: All 3 test apps built on first try. Need adversarial testing with deliberately broken/ambiguous prompts.
