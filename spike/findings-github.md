# Spike 3: GitHub Copilot Coding Agent Findings

## Summary

Researched GitHub Copilot coding agent APIs. **There is no dedicated coding agent API — it uses standard GitHub issue assignment. The newer "Tasks" UI has no public API. Template repo creation works via standard GitHub API.**

## How to Trigger the Coding Agent

### Method 1: Issue Assignment (Primary, API-accessible)

The most reliable programmatic trigger. Assign the `copilot` user to a GitHub issue:

```bash
# Create an issue
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{owner}/{repo}/issues" \
  -d '{"title": "Add feature X", "body": "Detailed description..."}'

# Assign Copilot
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/{owner}/{repo}/issues/{number}/assignees" \
  -d '{"assignees":["copilot"]}'
```

### Method 2: @mention in Issue Comment
`@copilot` in an issue body or comment also triggers the agent. Less programmatic but works.

### Method 3: Tasks UI (No Public API)
GitHub's `github.com/copilot/tasks` page allows creating tasks through the UI. As of research cutoff, **no public REST API** exists for this flow. The UI likely uses internal/undocumented endpoints.

## GraphQL Alternative

```graphql
mutation {
  addAssigneesToAssignable(input: {
    assignableId: "<ISSUE_NODE_ID>",
    assigneeIds: ["<COPILOT_BOT_NODE_ID>"]
  }) {
    assignable {
      ... on Issue { id title }
    }
  }
}
```

Get Copilot's node ID:
```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/users/copilot
# Use the "node_id" field from the response
```

## Requirements

- **Plan**: GitHub Copilot Enterprise or Copilot Pro+
- **Repo settings**: GitHub Actions must be enabled
- **Critical file**: `.github/copilot-setup-steps.yml` must exist in the repo

```yaml
# .github/copilot-setup-steps.yml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
  - run: npm install
```

## Webhook Events During Copilot Work

The agent uses standard GitHub events — no special Copilot-specific webhook types:

| Event | When |
|-------|------|
| `issues` (assigned) | Copilot assigned to issue |
| `issue_comment` (created) | Copilot posts status updates |
| `create` (branch) | Copilot creates working branch |
| `push` | Copilot pushes commits |
| `pull_request` (opened) | Copilot opens PR |
| `check_run` / `check_suite` | CI runs on Copilot's PR |

Identify Copilot activity by checking `sender.login` in webhook payloads.

## Template Repo Creation

Standard GitHub API — works:

```bash
# Create repo from template
POST /repos/{owner}/{template_repo}/generate
Body: {"owner": "{your-username}", "name": "kiss-preview-123", "private": false}
```

## What's NOT Available via API

1. No `/repos/{owner}/{repo}/copilot/tasks` endpoint
2. No way to query coding agent session status
3. No way to programmatically stop a running agent (except unassign/close issue)
4. No API for the Tasks UI flow
5. No coding agent-specific webhook events

## Assessment

**Automation feasibility: MODERATE**

The Copilot coding agent is automatable through issue assignment, but:
- **Latency**: Minutes to start working, potentially 10-30+ minutes for a PR
- **Reliability**: Variable — depends on prompt quality and repo setup
- **Control**: Limited — can't monitor progress, can't stop mid-run efficiently
- **Cost**: Requires Copilot Enterprise ($39/user/month) or Copilot Pro+ ($39/user/month)

**For KISS specifically**: Using Claude API directly for code generation (Spike 1) is likely faster, cheaper, and more controllable than routing through Copilot. Copilot could be useful for the "iteration" phase (user requests changes via issues) but adds latency and complexity.

## Recommended Approach for KISS

1. **Use Claude API directly** for initial code generation (faster, more control)
2. **Skip Copilot for MVP** — the latency and lack of status API make it hard to provide a good UX
3. **Consider Copilot later** for a "git-native" workflow where users iterate on generated code through issues
4. **Template repos work** — use them for the initial project skeleton before AI fills in the code
