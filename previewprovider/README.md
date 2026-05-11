# Sample Static Site Preview Provider

Standalone Node.js preview provider for CodeBolt artifact previews.

This does not use `@codebolt/plugin-sdk`. It uses `@codebolt/cloud-sdk/preview`, which connects directly to the cloud PreviewHub websocket and registers this app as a provider for `static_site` artifacts.

## Install

```bash
npm install
```

## Run

```bash
npm start -- --app-token <your-app-token>
```

Optional configuration:

```bash
APP_TOKEN=<your-app-token> npm start
PREVIEW_WS_BASE_URL=wss://codebolt-wrangler-ws.arrowai.workers.dev npm start
PREVIEW_WS_URL=wss://codebolt-wrangler-ws.arrowai.workers.dev/preview/ws/<your-app-token> npm start
```

## What It Handles

When the portal starts a preview for a `static_site` artifact, this provider:

1. Sends `artifactPreview.ack`.
2. Looks for downloadable file URLs in `artifact.files`, `artifact.fileUrls`, or `artifact.metadata.files`.
3. If the files only contain paths and the artifact has a stored `previewUrl`, derives download URLs from the artifact `/files/<path>` endpoint.
4. Downloads those files into a temp folder.
5. Starts a local HTTP server for the downloaded static site.
6. Sends `artifactPreview.ready` with the local URL.

This sample is intentionally local-first. It may use `externalUrl`, `previewUrl`, `url`, or `runtime.url` to infer cloud download endpoints, but it does not return those URLs directly as the preview result. The preview result should be the provider's local HTTP server URL.

Supported file URL fields:

- `url`
- `downloadUrl`
- `download_url`
- `signedUrl`
- `signed_url`
- `previewUrl`

Supported file path fields:

- `relativePath`
- `relative_path`
- `path`
- `name`

## Protocol Messages

Provider registration:

```json
{
  "type": "artifactPreviewProvider.register",
  "role": "provider",
  "provider": {
    "providerId": "sample-static-site-preview-provider",
    "name": "Sample Static Site Preview Provider",
    "kind": "remote",
    "artifactTypes": ["static_site"]
  }
}
```

Preview completion:

```json
{
  "type": "artifactPreview.ready",
  "providerId": "sample-static-site-preview-provider",
  "result": {
    "kind": "url",
    "url": "http://127.0.0.1:49152/",
    "label": "Static Site Preview"
  }
}
```

Stop preview:

```json
{
  "type": "artifactPreview.stop",
  "previewId": "preview-id"
}
```

The sample provider closes the local HTTP server for that `previewId` and responds with `artifactPreview.stopped`.
