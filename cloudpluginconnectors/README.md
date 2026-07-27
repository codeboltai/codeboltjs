# CodeBolt Cloud Plugin Connectors

Deployable Cloudflare Worker connector examples. Each worker owns its connector manifest and exposes a common registry surface:

- `GET /manifest`
- `GET /tools`
- `POST /execute`
- `GET /:connectorId/install`
- `GET /:connectorId/callback`

## Workers

- `workers/dev-connectors`: GitHub and GitLab
- `workers/work-connectors`: ClickUp, Linear, and Jira
- `workers/comm-connectors`: Slack, Gmail, and Google Calendar

## Deploy

```powershell
npm install
npm run deploy:dev
npm run deploy:work
npm run deploy:comm
```

After deployment, open CodeBolt Admin > Connectors and add each worker base URL. Admin reads `<worker-url>/manifest` and aggregates the connector catalog dynamically.

## Manifest Ownership

Admin stores worker URLs. Connector definitions, route paths, required secrets, capabilities, and tool schemas belong to the connector worker manifest, not the admin app.
