# Codebolt Wrangler WebSocket Proxy

This package provides a Cloudflare Worker plus Durable Object that relays WebSocket messages between Codebolt agents and applications. The Durable Object maintains long-lived connections, queues payloads while peers are offline, and exposes a single `/proxy` endpoint for upgrades.

## Installation

```bash
# Install dependencies
npm install

# or
pnpm install

# or
yarn install
```

## Quick start

1. Install Wrangler and authenticate with Cloudflare:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Start the proxy locally:
   ```bash
   npm run dev
   # or
   wrangler dev
   ```

3. Connect agents/apps to `ws://localhost:8787/proxy` and send JSON messages shaped like:
   - `{"type":"register","actor":"agent","agentId":"agent-123","appToken":"my-app"}`
   - `{"type":"register","actor":"app","appToken":"my-app"}`
   - `{"type":"forward","actor":"agent","agentId":"agent-123","appToken":"my-app","target":"app","payload":{...}}`

## Deployment

### Development Environment
```bash
npm run deploy
# or
wrangler deploy
```

### Staging Environment
```bash
npm run deploy:staging
# or
wrangler deploy --env staging
```

### Production Environment
```bash
npm run deploy:production
# or
wrangler deploy --env production
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Type check the TypeScript code
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run deploy` - Deploy to development environment
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production environment
- `npm run tail` - View real-time logs from the deployed worker

## Configuration

The `wrangler.toml` file contains the configuration for your Cloudflare Worker:

- **name**: The name of your worker
- **main**: The entry point file
- **compatibility_date**: The Cloudflare Workers API compatibility date
- **durable_objects**: Configuration for Durable Objects
- **vars**: Environment variables (different per environment)

Update the values in `wrangler.toml` with your account details before deploying.

## Environment Variables

- `ENVIRONMENT`: Set to "development", "staging", or "production"

## Project Structure

```
├── src/
│   ├── durable/
│   │   └── proxyHub.ts    # Durable Object implementation
│   ├── index.ts           # Main exports
│   ├── types.ts           # TypeScript type definitions
│   └── worker.ts          # Cloudflare Worker entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── wrangler.toml          # Cloudflare Workers configuration
└── README.md              # This file
```

## Requirements

- Node.js 18+ 
- Wrangler CLI 3+
- Cloudflare account