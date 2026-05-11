# CodeBolt Preview Plugin

Artifact preview provider for CodeBolt local app and CodeBolt Cloud.

The plugin serves artifact folders with a small local HTTP server and returns the preview URL to CodeBolt. It supports:

- Local app artifacts from `.codebolt/artifacts/...` via `@codebolt/plugin-sdk`.
- Cloud artifacts by downloading file URLs into a temp directory, serving that directory, and returning a localhost URL via `@codebolt/cloud-sdk`.
- URL artifacts as a fallback when there are no files to serve.

## Environment

Local app mode starts automatically when CodeBolt launches this plugin.

Cloud mode starts when an app token or explicit preview WebSocket URL is present:

```powershell
$env:CODEBOLT_APP_TOKEN = "<login/app token>"
$env:CODEBOLT_USER_ID = "<optional user id>"
$env:CODEBOLT_CLOUD_URL = "https://api.codebolt.ai"
npm start
```

Useful options:

- `PREVIEW_PLUGIN_PROVIDER_ID` defaults to `codebolt-http-artifact-preview`
- `PREVIEW_PLUGIN_PROVIDER_NAME` defaults to `CodeBolt HTTP Artifact Preview`
- `PREVIEW_HOST` defaults to `127.0.0.1`
- `PREVIEW_PORT` defaults to `0`, which asks the OS for a free port
- `PREVIEW_LOCAL_ENABLED=false` disables local plugin registration
- `PREVIEW_CLOUD_ENABLED=false` disables cloud registration

## Build

```powershell
npm install
npm run build
```
