# MiniApp Authoring Contract

## Contents

- [Collections](#collections)
- [Document Storage](#document-storage)
- [Blob Storage](#blob-storage)
- [Tasks](#tasks)
- [Tools](#tools)
- [API Routes](#api-routes)
- [Frontend](#frontend)
- [Identity And Authorization](#identity-and-authorization)

## Collections

Put collection definitions under `server/collections` and default-export them:

```ts
import { defineCollection } from "@codebolt/miniapp";

export default defineCollection({
  name: "customers",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      email: { type: "string" },
    },
  },
});
```

Definitions describe manifest/catalog schema. Platform storage enforces the
MiniApp/install/workspace namespace.

## Document Storage

Available operations:

```ts
context.db.get(collection, id)
context.db.getMany(collection, ids)
context.db.set(collection, id, document)
context.db.setMany(collection, [{ id, document }])
context.db.delete(collection, id)
context.db.deleteMany(collection, ids)
context.db.list(collection, { prefix, cursor, limit })
```

`list` returns `{ documents, cursor? }`; it does not return a bare array.
Preserve cursors in paginated APIs and avoid N+1 reads.

Use stable record ids. Put the id inside the document when UI/API consumers
need it; the store key is not guaranteed to be injected into returned data.

## Blob Storage

Available operations:

```ts
context.blob.get(key)
context.blob.put(key, uint8Array, { contentType })
context.blob.delete(key)
context.blob.list({ prefix, cursor, limit })
```

Convert request data explicitly to `Uint8Array`. Store only app-relative keys;
do not add workspace or user prefixes because the platform already namespaces
the store.

Return blobs from API routes with an explicit `content-type`. Do not expose
private blob keys in public HTML unless access policy permits it.

## Tasks

Available operations:

```ts
context.codebolt.tasks.create({ title, entityType, entityId })
context.codebolt.tasks.list({ entityType, entityId })
context.codebolt.tasks.count({ entityType, entityId })
```

Associate tasks with stable MiniApp entities. Use `count` for badges instead of
fetching all tasks.

## Tools

Place one default-exported tool definition per file under `server/tools`:

```ts
import { defineTool } from "@codebolt/miniapp";

type AddCustomerInput = { id: string; name: string; email?: string };

export default defineTool<AddCustomerInput>({
  name: "add-customer",
  description: "Create or replace a customer intake record.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      email: { type: "string" },
    },
  },
  async handler(context, input) {
    return context.db.set("customers", input.id, input);
  },
});
```

Tool names must be unique in one MiniApp. The manifest qualifies them as
`<miniAppId>.<toolName>`; CodeBolt's local/cloud tool registry may add its own
surface prefix.

Use precise descriptions and closed input schemas. Keep tools coarse enough to
complete one meaningful operation. Never compile Ajv or another code-generating
validator during a Worker request; the Nitro module emits standalone validators
at build time.

## API Routes

Use Nitro file-based handlers. Always pass `event` into `useMiniApp`:

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => {
  return useMiniApp(event).db.list("customers", { limit: 50 });
});
```

For mutation routes, parse and validate the body before storage:

```ts
import { defineHandler, readBody } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler(async (event) => {
  const input = await readBody<{ id?: string; name?: string }>(event);
  if (!input?.id || !input?.name) {
    return new Response(JSON.stringify({ error: "id and name are required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  return useMiniApp(event).db.set("customers", input.id, {
    id: input.id,
    name: input.name,
  });
});
```

Files map to routes:

```text
server/api/customers.get.ts       GET /api/customers
server/api/customers.post.ts      POST /api/customers
server/api/customers/[id].get.ts  GET /api/customers/:id
server/routes/health.get.ts       GET /health
```

## Frontend

Static HTML is sufficient for simple MiniApps. Existing React/Vue/Svelte
frontends are fine when their assets are emitted into Nitro public output.

Call relative app APIs:

```js
const response = await fetch("/api/customers");
if (!response.ok) throw new Error(`Request failed: ${response.status}`);
const result = await response.json();
```

Do not call:

- `http://localhost:*` or a production hostname
- MiniApp Server management routes
- `/__codebolt/tools/*` from browser UI
- direct storage or Edge control-plane endpoints

## Identity And Authorization

Trust only the runtime context:

```ts
const { miniAppId, installId, workspaceId, principal } = useMiniApp(event);
```

Never use client-supplied identity for namespace selection. Installation access
(`private`, `authenticated`, `public`) is enforced at the router/runtime
boundary. Add app-level authorization only for domain rules within an already
authorized installation.
