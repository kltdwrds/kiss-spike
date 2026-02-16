# Spike 2: Deployment Findings

## Summary

Tested programmatic deployment of Workers to Cloudflare via API. **Regular Worker deployment works. Workers for Platforms requires a paid add-on. D1 requires additional token permissions.**

## Test Results

### Workers for Platforms (Dispatch Namespaces)

**Status: NOT AVAILABLE on current plan**

```
POST /accounts/{id}/workers/dispatch/namespaces
→ Error 10121: "You do not have access to dispatch namespaces.
   You can purchase it within the Cloudflare dashboard here:
   https://dash.cloudflare.com?to=/:account/workers-for-platforms"
```

- Requires purchasing Workers for Platforms separately
- Available on Workers Paid plan ($5/month base) + WfP add-on ($25/month)
- Enterprise customers can contact their account team
- The correct HTTP method is POST (not PUT as some docs suggest)

### Regular Worker Deployment via API

**Status: WORKS**

Successfully deployed a Worker using the multipart upload API:

```bash
# Working format:
curl -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{script_name}" \
  -H "Authorization: Bearer {token}" \
  -F 'metadata={"main_module":"index.js","compatibility_date":"2024-01-01"};type=application/json' \
  -F "index.js=@/path/to/worker.js;type=application/javascript+module"
```

**Key details:**
- The `metadata` field must be inline JSON (not a file reference) OR a file with proper `type=application/json`
- The module part name must **exactly match** the `main_module` value in metadata
- Content type for ES modules: `application/javascript+module`
- Compatibility flags (like `nodejs_compat`) go in metadata
- Response includes `deployment_id` for tracking
- Deletion works: `DELETE /accounts/{id}/workers/scripts/{name}` returns success

**Quirks discovered:**
- `application/javascript` content-type alone (without multipart) does NOT work
- The part name for the script file IS the module name — there's no separate filename field
- Inline metadata format: `'metadata={...};type=application/json'` works with `-F`

### D1 Database Provisioning

**Status: BLOCKED — Token permissions**

```
POST /accounts/{id}/d1/database → Error 10000: "Authentication error"
GET /accounts/{id}/d1/database → Error 10000: "Authentication error"
```

The API token doesn't have D1 permissions. Needs `D1:Edit` scope added in Cloudflare dashboard.

**Expected API flow (from docs):**
```bash
# Create database
POST /accounts/{id}/d1/database
Body: {"name": "my-db"}
→ Returns: {database_id, name, ...}

# Run SQL
POST /accounts/{id}/d1/database/{database_id}/query
Body: {"sql": "CREATE TABLE ..."}

# Bind to Worker (via metadata in Worker upload)
metadata: {
  "main_module": "index.js",
  "d1_databases": [{"binding": "DB", "id": "{database_id}"}]
}
```

### Static Asset Handling for rwsdk Builds

**Not yet tested** (requires a successful rwsdk build output to test).

From examining rwsdk's wrangler.jsonc config, static assets use:
```jsonc
{
  "assets": { "binding": "ASSETS" }
}
```

In Cloudflare Workers, assets can be uploaded alongside the Worker script. The `vite build` output should produce a `dist/` directory with:
- Worker bundle (JavaScript)
- Static assets (CSS, images, etc.)

For programmatic deployment, assets would likely need to be uploaded as additional parts in the multipart form, or served from R2.

## Deployment Flow (What Would Work)

For the MVP without Workers for Platforms:

1. **Generate unique Worker name** per preview (e.g., `kiss-preview-{uuid}`)
2. **Upload built Worker** via multipart PUT API
3. **Create D1 database** if needed, bind via metadata
4. **Worker URL**: `https://kiss-preview-{uuid}.{account-subdomain}.workers.dev`
5. **Cleanup**: DELETE Worker + DELETE D1 database

## Cost Considerations

| Component | Cost |
|-----------|------|
| Workers Free | 100K requests/day |
| Workers Paid | $5/month + $0.30/M requests |
| Workers for Platforms | $25/month |
| D1 | 5M reads/day free, $0.75/M after |
| R2 | 10GB free, $0.015/GB/month after |

For MVP, **regular Workers + D1 is sufficient**. Workers for Platforms adds isolation and custom domains but isn't required.

## Recommended Next Steps

1. Add D1 permissions to the Cloudflare API token
2. Test D1 create → schema → bind → query flow
3. Get a successful rwsdk build and test deploying its output
4. Test the full pipeline: build → upload Worker + assets → D1 setup → verify live URL
