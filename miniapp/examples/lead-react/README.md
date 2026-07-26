# React Leads MiniApp

A minimal React MiniApp example.

It keeps the MiniApp surface intentionally small:

- Vite builds the React UI into `public/`
- Nitro packages `public/` and `server/`
- `server/api/leads.get.ts` lists stored leads
- `server/tools/add-lead.ts` stores a lead through `context.db`
- `server/collections/leads.ts` declares the lead schema

From the workspace root:

```powershell
pnpm build:lead-react
pnpm start
```

Open:

```text
http://lead-react.localhost:4310
```
