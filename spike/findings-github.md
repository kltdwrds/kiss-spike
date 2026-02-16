# Spike 3: GitHub API & Copilot Coding Agent Findings

## Summary

Tested GitHub APIs for the full KISS workflow: template repos, issue/PR lifecycle, branch management, and file commits. **All standard GitHub APIs work. Copilot coding agent is a bonus (requires paid plan) but not required — standard APIs give us everything needed.**

## Live API Test Results

All tests run against `kltdwrds/kiss-spike` with a fine-grained PAT.

| Operation | API | Status |
|-----------|-----|--------|
| Create issue | `POST /repos/{owner}/{repo}/issues` | WORKS |
| Comment on issue/PR | `POST /repos/{owner}/{repo}/issues/{n}/comments` | WORKS |
| Assign user to issue | `POST /repos/{owner}/{repo}/issues/{n}/assignees` | WORKS (copilot user requires paid plan) |
| Make repo a template | `PATCH /repos/{owner}/{repo}` with `is_template: true` | WORKS |
| Generate repo from template | `POST /repos/{owner}/{template}/generate` | WORKS |
| Create branch | `POST /repos/{owner}/{repo}/git/refs` | WORKS |
| Push file to branch | `PUT /repos/{owner}/{repo}/contents/{path}` | WORKS |
| Create PR | `POST /repos/{owner}/{repo}/pulls` | WORKS |
| Read PR details | `GET /repos/{owner}/{repo}/pulls/{n}` | WORKS |
| Close PR/issue | `PATCH .../pulls/{n}` or `.../issues/{n}` | WORKS |
| Delete branch | `DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}` | WORKS |
| Delete file | `DELETE /repos/{owner}/{repo}/contents/{path}` | WORKS |
| Delete repo | `DELETE /repos/{owner}/{repo}` | Needs `delete_repo` scope |

## KISS Flow via Standard GitHub APIs

The key insight: **we don't need Copilot-specific APIs**. Standard GitHub APIs support the entire KISS workflow:

```
1. POST /repos/{template}/generate          → Create user's repo from template
2. POST /repos/{repo}/git/refs              → Create feature branch
3. PUT  /repos/{repo}/contents/{file}       → Push generated code (per file)
4. POST /repos/{repo}/pulls                 → Open PR with generated code
5. POST /repos/{repo}/issues/{n}/comments   → Add context/instructions
6. GET  /repos/{repo}/pulls/{n}             → Monitor PR status
7. (Optional) Assign Copilot for iteration  → POST .../assignees with copilot
```

### Alternative: Push via Git (faster for many files)

For pushing multiple files (a full generated app), the Contents API requires one request per file. Better options:

```bash
# Option A: Git Data API (create tree + commit in one shot)
POST /repos/{repo}/git/trees     → Create tree with all files
POST /repos/{repo}/git/commits   → Create commit pointing to tree
PATCH /repos/{repo}/git/refs     → Update branch ref

# Option B: Clone + push (simpler, uses git directly)
git clone → write files → git add → git commit → git push
```

## Copilot Coding Agent

### How It Works (from research + GitHub blog)

- Triggered by assigning `copilot` (or `github`) to an issue, or @mentioning in comments
- Uses GitHub Actions minutes + "premium requests"
- Agent creates a branch, pushes commits, opens a PR
- All activity uses standard GitHub events (no special Copilot webhooks)
- New "Agents Panel" at `github.com/copilot/agents` for task management
- MCP integration for extensibility (Playwright, custom servers)

### Requirements

- Copilot Pro+ or Enterprise plan
- GitHub Actions enabled on the repo
- `.github/copilot-setup-steps.yml` in the repo

### What We Couldn't Test

- Assigning `copilot` to an issue returned empty assignees (account doesn't have Copilot coding agent)
- The `copilot` user doesn't exist as a standard GitHub user (`/users/copilot` → 404)
- Can't verify if the bot user is now `github` (which is an org, not a bot)

### Assessment for KISS

**Copilot is optional, not required.** The KISS workflow works entirely with standard GitHub APIs:

| Approach | Initial Gen | Iteration | Latency | Cost |
|----------|------------|-----------|---------|------|
| Claude API + GitHub API | Claude generates code, push via API | New Claude call + push | ~15-30s | ~$0.05/gen |
| Claude API + Copilot | Claude generates code, push via API | Assign Copilot to issues | 10-30min | $39/mo + gen |
| Copilot only | Assign Copilot to initial issue | Assign Copilot to follow-ups | 10-30min | $39/mo |

**Recommendation**: Use Claude API for generation + standard GitHub APIs for the git workflow. Copilot adds latency and cost without clear benefit for KISS's use case.

## Token Permissions Needed

For a fine-grained PAT scoped to the KISS template repo:

| Permission | Level | For |
|------------|-------|-----|
| Contents | Read & Write | Push files, create branches |
| Issues | Read & Write | Create issues, assign, comment |
| Pull Requests | Read & Write | Create/read PRs |
| Administration | Read & Write | Template repo management |
| Actions | Read & Write | Trigger/monitor workflows |
| Metadata | Read | Required base permission |

For creating new repos from templates, the token also needs the `repo` scope or account-level permissions.

## Template Repo Strategy

Tested and validated:
1. `PATCH /repos/{owner}/{repo}` with `is_template: true` → mark repo as template
2. `POST /repos/{owner}/{template}/generate` → create new repo from template
3. New repo gets all template files, branches, and structure

For KISS: maintain a template repo with the rwsdk skeleton (package.json, vite.config.mts, tsconfig.json, wrangler.jsonc, src/client.tsx). Generate per-user repos from it, then push the Claude-generated app code.
