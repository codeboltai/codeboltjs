# CodeBolt MiniApp Runtime Prototype

This standalone workspace demonstrates two Nitro v3 MiniApps hosted by one local
CodeBolt process and one port. Static assets and cached manifests do not wake app
workers. API and tool calls lazily start one Worker Thread per MiniApp.

```powershell
pnpm install --force
pnpm test
pnpm start
```

The local applications are available at:

- `http://leads.localhost:4310`
- `http://onboarding.localhost:4310`

The prototype deliberately does not modify the parent `codeboltjs` workspace.
Worker Threads isolate runtime state and crashes, but they are not a security
sandbox for hostile code.
