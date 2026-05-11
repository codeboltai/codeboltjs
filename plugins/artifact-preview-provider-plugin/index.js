const fs = require('fs');
const http = require('http');
const path = require('path');
const plugin = require('/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/sdks/pluginSdk/dist/index.js').default;

const projectRoot = path.resolve(__dirname, '..', '..');
const logFile = path.join(projectRoot, '.codebolt', 'artifact-preview-provider-events.jsonl');
const previewServers = new Map();

function append(event) {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, `${JSON.stringify({ time: new Date().toISOString(), event })}\n`, 'utf8');
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain; charset=utf-8'
  };

  return types[ext] || 'application/octet-stream';
}

function encodeUrlPath(relativePath) {
  return relativePath
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function fileForRequest(rootDir, req) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    return { status: 400 };
  }

  const relativePath = decodedPath.replace(/^\/+/, '') || 'index.html';
  const target = path.resolve(rootDir, relativePath);
  const root = path.resolve(rootDir);
  const relativeToRoot = path.relative(root, target);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return { status: 403 };
  }

  if (!fs.existsSync(target)) {
    const acceptsHtml = String(req.headers.accept || '').includes('text/html');
    const fallback = path.join(root, 'index.html');
    if (acceptsHtml && fs.existsSync(fallback)) {
      return { status: 200, filePath: fallback };
    }
    return { status: 404 };
  }

  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const indexPath = path.join(target, 'index.html');
    if (fs.existsSync(indexPath)) {
      return { status: 200, filePath: indexPath };
    }
    return { status: 404 };
  }

  return { status: 200, filePath: target };
}

function createStaticServer(rootDir) {
  const root = path.resolve(rootDir);
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }

    const result = fileForRequest(root, req);
    if (!result.filePath) {
      res.writeHead(result.status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(result.status === 400 ? 'Bad request' : result.status === 403 ? 'Forbidden' : 'Not found');
      return;
    }

    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Content-Type': contentTypeFor(result.filePath)
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(result.filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Unable to read file');
    });
    stream.pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      resolve({ server, port: address.port, root });
    });
  });
}

async function getPreviewServer(artifact) {
  const rootDir = artifact.storagePath;
  if (!rootDir) {
    throw new Error('Artifact does not include a storagePath to serve.');
  }

  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    throw new Error(`Artifact storagePath is not a directory: ${rootDir}`);
  }

  const existing = previewServers.get(artifact.id);
  if (existing && existing.root === path.resolve(rootDir)) {
    return existing;
  }

  if (existing) {
    existing.server.close();
    previewServers.delete(artifact.id);
  }

  const next = await createStaticServer(rootDir);
  previewServers.set(artifact.id, next);
  append({ type: 'static-server-started', artifactId: artifact.id, root: next.root, port: next.port });
  return next;
}

async function previewUrlForArtifact(artifact) {
  const directUrl = artifact.externalUrl || artifact.runtime?.url || artifact.previewUrl;
  if (typeof directUrl === 'string' && directUrl.startsWith('http')) {
    return directUrl;
  }

  const { port } = await getPreviewServer(artifact);
  const entrypoint = artifact.entrypoint || 'index.html';
  const encodedEntrypoint = encodeUrlPath(entrypoint);
  return `http://127.0.0.1:${port}/${encodedEntrypoint}`;
}

plugin.onStart(async (ctx) => {
  append({ type: 'plugin-started', pluginId: ctx.pluginId });
  const registration = await plugin.artifact.registerPreviewProvider({
    providerId: 'sample-static-site-preview',
    name: 'Sample Static Site Preview',
    artifactTypes: ['static_site'],
    description: 'Returns the artifact static-site preview URL after a short setup delay.'
  });
  append({ type: 'provider-registered', registration });

  plugin.artifact.onPreviewRequest(async (request) => {
    append({ type: 'preview-request', previewId: request.previewId, artifactId: request.artifact.id, title: request.artifact.title });
    plugin.artifact.acknowledgePreview(request.previewId, 'Sample preview provider acknowledged the artifact.');

    setTimeout(async () => {
      try {
        const url = await previewUrlForArtifact(request.artifact);
        plugin.artifact.sendPreviewStarted(request.previewId, {
          kind: 'url',
          url,
          label: 'Open sample preview',
          message: 'Sample preview provider generated a URL.',
          openIn: 'artifact_panel'
        }, 'Sample preview is ready.');
        append({ type: 'preview-ready', previewId: request.previewId, url });
      } catch (error) {
        plugin.artifact.sendPreviewError(request.previewId, error && error.message ? error.message : String(error));
        append({ type: 'preview-error', previewId: request.previewId, message: error && error.message ? error.message : String(error) });
      }
    }, 500);
  });
});

plugin.onStop(async () => {
  for (const [artifactId, previewServer] of previewServers.entries()) {
    previewServer.server.close();
    append({ type: 'static-server-stopped', artifactId, port: previewServer.port });
  }
  previewServers.clear();
  append({ type: 'plugin-stopped' });
});
