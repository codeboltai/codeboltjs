import {
  createPreviewProvider,
  downloadArtifactFiles,
  getDownloadableArtifactFiles,
  serveDirectory,
} from '@codebolt/preview-sdk'

const DEFAULT_WS_BASE_URL = 'wss://codebolt-wrangler-ws.arrowai.workers.dev'
const PROVIDER_ID = process.env.PROVIDER_ID || 'sample-static-site-preview-provider'
const PROVIDER_NAME = process.env.PROVIDER_NAME || 'Sample Static Site Preview Provider'

const args = parseArgs(process.argv.slice(2))
const appToken = args.appToken || process.env.APP_TOKEN || process.env.CODEBOLT_APP_TOKEN
const wsUrl = args.wsUrl || process.env.PREVIEW_WS_URL
const wsBaseUrl = args.wsBase || process.env.PREVIEW_WS_BASE_URL || DEFAULT_WS_BASE_URL

if (!appToken && !wsUrl) {
  console.error('Missing app token. Set APP_TOKEN or pass --app-token <token>.')
  process.exit(1)
}

const activeServers = new Map()

const provider = createPreviewProvider({
  appToken,
  wsUrl,
  wsBaseUrl,
  logger: console,
  provider: {
    providerId: PROVIDER_ID,
    name: PROVIDER_NAME,
    kind: 'remote',
    artifactTypes: ['static_site'],
    description: 'Standalone Node.js provider that downloads static-site artifact files and serves them locally.',
    metadata: {
      sample: true,
      mode: 'local-first',
      supports: ['download-file-urls', 'local-http-server'],
    },
  },
})

provider.onStatus((status, detail) => {
  if (detail) {
    console.log(`[preview-provider] ${status}`, detail)
  } else {
    console.log(`[preview-provider] ${status}`)
  }
})

provider.onPreviewRequest(async (request) => {
  console.log(`[preview-provider] start request previewId=${request.previewId} artifact=${request.artifact.id || request.artifact.artifactId || 'unknown'} type=${request.artifact.type || 'unknown'}`)
  request.ack('Downloading artifact files for local preview...')

  const downloadableFiles = getLocalFirstDownloadableFiles(request)
  if (downloadableFiles.length === 0) {
    const directUrl = request.getDirectUrl()
    request.error(
      directUrl
        ? 'Artifact has a direct URL, but this local-first provider could not infer downloadable file URLs.'
        : 'Artifact has no downloadable file URLs.',
    )
    return
  }

  const previewDir = await downloadArtifactFiles(downloadableFiles, {
    previewId: request.previewId,
  })
  const server = await serveDirectory(previewDir, {
    entrypoint: typeof request.artifact.entrypoint === 'string'
      ? request.artifact.entrypoint
      : 'index.html',
  })
  activeServers.set(request.previewId, server)
  console.log(`[preview-provider] serving downloaded artifact at ${server.url}`)

  request.ready({
    kind: 'url',
    url: server.url,
    label: request.artifact.title || 'Static Site Preview',
    message: `Serving ${downloadableFiles.length} downloaded artifact file(s).`,
  })
})

provider.onStopPreview(async (message) => {
  const server = activeServers.get(message.previewId)
  if (!server) {
    console.log(`[preview-provider] stop request previewId=${message.previewId} no active server`)
    return
  }

  console.log(`[preview-provider] stopping local preview ${server.url}`)
  await server.close()
  activeServers.delete(message.previewId)
})

await provider.start()

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--app-token') parsed.appToken = argv[++i]
    else if (arg === '--ws-url') parsed.wsUrl = argv[++i]
    else if (arg === '--ws-base') parsed.wsBase = argv[++i]
  }
  return parsed
}

function getLocalFirstDownloadableFiles(request) {
  const explicitFiles = getDownloadableArtifactFiles(request.artifact)
  if (explicitFiles.length > 0) return explicitFiles

  const directUrl = request.getDirectUrl()
  if (!directUrl) return []

  const artifactFiles = Array.isArray(request.artifact.files)
    ? request.artifact.files
    : Array.isArray(request.artifact.metadata?.files)
      ? request.artifact.metadata.files
      : []

  const baseUrl = artifactFilesBaseUrl(directUrl)
  if (!baseUrl) return []

  return artifactFiles
    .map((file, index) => {
      const relativePath = typeof file === 'string'
        ? file
        : file?.relativePath || file?.relative_path || file?.path || file?.name
      if (!relativePath) return null
      return {
        url: `${baseUrl}/${encodeRelativePath(relativePath)}`,
        relativePath: String(relativePath).replace(/\\/g, '/').replace(/^\/+/, '') || `file-${index}`,
        size: typeof file?.size === 'number' ? file.size : undefined,
        contentType: file?.contentType || file?.content_type || file?.mimeType || file?.mime_type,
      }
    })
    .filter(Boolean)
}

function artifactFilesBaseUrl(directUrl) {
  try {
    const url = new URL(directUrl)
    const marker = '/files/'
    const markerIndex = url.pathname.indexOf(marker)
    if (markerIndex === -1) return null
    url.pathname = url.pathname.slice(0, markerIndex + marker.length - 1)
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

function encodeRelativePath(path) {
  return String(path)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
}

async function shutdown() {
  for (const server of activeServers.values()) {
    await server.close().catch(() => undefined)
  }
  await provider.stop()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown()
})
process.on('SIGTERM', () => {
  void shutdown()
})
