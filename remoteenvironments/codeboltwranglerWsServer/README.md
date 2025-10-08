# Codebolt Wrangler WebSocket Proxy

This package provides a Cloudflare Worker plus Durable Object that relays WebSocket messages between Codebolt agents and applications. The Durable Object maintains long-lived connections, queues payloads while peers are offline, and exposes a single `/proxy` endpoint for upgrades.

## Quick start

1. Install Wrangler and authenticate with Cloudflare.
2. From this directory run `pnpm wrangler dev` (or `npx wrangler dev`) to start the proxy locally.
3. Connect agents/apps to `ws://localhost:8787/proxy` and send JSON messages shaped like:
   - `{"type":"register","actor":"agent","agentId":"agent-123","appToken":"my-app"}`
   - `{"type":"register","actor":"app","appToken":"my-app"}`
   - `{"type":"forward","actor":"agent","agentId":"agent-123","appToken":"my-app","target":"app","payload":{...}}`

Update the values in `wrangler.toml` with your account details before running `pnpm wrangler deploy` to publish the worker.