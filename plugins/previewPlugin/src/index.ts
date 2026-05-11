import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { Artifact, ArtifactPreviewRequest } from '@codebolt/plugin-sdk';
import {
  createPreviewProvider,
  downloadArtifactFiles,
  getDirectArtifactUrl,
  getDownloadableArtifactFiles,
  serveDirectory,
  type ArtifactPreviewArtifact,
  type DownloadableArtifactFile,
  type PreviewProviderClient,
  type PreviewRequest,
  type StaticPreviewServer,
} from '@codebolt/cloud-sdk/preview';

type PreviewMode = 'local' | 'cloud';
type PluginSdk = {
  onStart(handler: () => void | Promise<void>): void;
  onStop(handler: () => void | Promise<void>): void;
  artifact: {
    registerPreviewProvider(manifest: Record<string, unknown>): Promise<unknown>;
    onPreviewRequest(handler: (request: ArtifactPreviewRequest) => void | Promise<void>): void;
    acknowledgePreview(previewId: string, message?: string): void;
    sendPreviewReady(previewId: string, result: Record<string, unknown>, message?: string): void;
    sendPreviewError(previewId: string, error: string, message?: string): void;
  };
};

interface ActivePreview {
  previewId: string;
  mode: PreviewMode;
  server?: StaticPreviewServer;
  url: string;
  tempDir?: string;
}

interface ResolvedPreview {
  url: string;
  server?: StaticPreviewServer;
  tempDir?: string;
  servedFrom?: string;
  direct: boolean;
}

interface ArtifactRoot {
  dir: string;
  entrypoint?: string;
}

const PROVIDER_ID = process.env.PREVIEW_PLUGIN_PROVIDER_ID || 'codebolt-http-artifact-preview';
const PROVIDER_NAME = process.env.PREVIEW_PLUGIN_PROVIDER_NAME || 'CodeBolt HTTP Artifact Preview';
const HOST = process.env.PREVIEW_HOST || '127.0.0.1';
const PORT = parsePort(process.env.PREVIEW_PORT);
const ARTIFACT_TYPES = [
  'static_site',
  'dynamic_site',
  'image',
  'video',
  'file',
  'url',
  'other',
];

const activePreviews = new Map<string, ActivePreview>();
let cloudClient: PreviewProviderClient | null = null;

void main().catch((error) => {
  console.error('[previewPlugin] Failed to start:', error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const cloudEnabled = shouldStartCloudProvider();
  const localDefault = isPluginRuntime() || !cloudEnabled;
  const localEnabled = isEnabled(process.env.PREVIEW_LOCAL_ENABLED, localDefault);

  if (localEnabled) {
    const localPlugin = await loadPluginSdk();
    localPlugin.onStart(async () => {
      await startLocalProvider(localPlugin);
      if (cloudEnabled) await startCloudProvider();
    });
    localPlugin.onStop(stopEverything);
    return;
  }

  if (cloudEnabled) {
    await startCloudProvider();
    installProcessShutdownHandlers();
    return;
  }

  console.warn('[previewPlugin] No preview mode enabled. Set CODEBOLT_APP_TOKEN for cloud mode or run as a CodeBolt plugin.');
}

async function loadPluginSdk(): Promise<PluginSdk> {
  const module = await import('@codebolt/plugin-sdk');
  return ((module as any).default || module) as PluginSdk;
}

async function stopEverything(): Promise<void> {
  if (cloudClient) {
    await cloudClient.stop();
    cloudClient = null;
  }
  await stopAllPreviews();
}

async function startLocalProvider(localPlugin: PluginSdk): Promise<void> {
  await localPlugin.artifact.registerPreviewProvider({
    providerId: PROVIDER_ID,
    name: PROVIDER_NAME,
    artifactTypes: ARTIFACT_TYPES as any,
    description: 'Serves artifact files from the local artifact folder over HTTP.',
  });

  localPlugin.artifact.onPreviewRequest(async (request: ArtifactPreviewRequest) => {
    const previewId = request.previewId;
    try {
      localPlugin.artifact.acknowledgePreview(previewId, 'Starting local HTTP artifact preview...');
      const resolved = await preparePreview(previewId, request.artifact, 'local');
      rememberPreview(previewId, 'local', resolved);
      localPlugin.artifact.sendPreviewReady(
        previewId,
        {
          kind: 'url',
          url: resolved.url,
          openIn: 'artifact_panel',
          label: 'Open Preview',
          title: request.artifact.title || 'Artifact preview',
          metadata: {
            providerId: PROVIDER_ID,
            servedFrom: resolved.servedFrom,
            direct: resolved.direct,
          },
        } as any,
        'Artifact preview is ready.',
      );
    } catch (error) {
      localPlugin.artifact.sendPreviewError(previewId, errorMessage(error), 'Failed to start artifact preview.');
    }
  });

  console.log(`[previewPlugin] Registered local preview provider ${PROVIDER_ID}`);
}

async function startCloudProvider(): Promise<void> {
  cloudClient = createPreviewProvider({
    appToken: process.env.CODEBOLT_APP_TOKEN || process.env.APP_TOKEN,
    userId: process.env.CODEBOLT_USER_ID || process.env.USER_ID,
    cloudUrl: process.env.CODEBOLT_CLOUD_URL || process.env.CLOUD_URL,
    wsUrl: process.env.PREVIEW_WS_URL,
    provider: {
      providerId: PROVIDER_ID,
      name: PROVIDER_NAME,
      kind: 'local',
      artifactTypes: ARTIFACT_TYPES,
      description: 'Local HTTP server preview provider for cloud artifacts.',
      metadata: {
        output: 'url',
        openIn: 'portal_panel',
        server: 'node:http',
      },
    },
    logger: console,
  });

  cloudClient
    .onStatus((status) => console.log(`[previewPlugin] Cloud preview provider ${status}`))
    .onPreviewRequest(handleCloudPreviewRequest)
    .onStopPreview(async (message) => {
      const stopped = await stopPreview(message.previewId);
      console.log(`[previewPlugin] Cloud preview stop ${message.previewId}: ${stopped ? 'closed' : 'not-found'}`);
    });

  await cloudClient.start();
}

async function handleCloudPreviewRequest(request: PreviewRequest): Promise<void> {
  request.ack('Starting local HTTP artifact preview...');
  const resolved = await preparePreview(request.previewId, request.artifact, 'cloud');
  rememberPreview(request.previewId, 'cloud', resolved);
  request.ready({
    kind: 'url',
    url: resolved.url,
    openIn: 'portal_panel',
    label: 'Open Preview',
    title: request.artifact.title || 'Artifact preview',
    message: 'Artifact preview is ready.',
    metadata: {
      providerId: PROVIDER_ID,
      servedFrom: resolved.servedFrom,
      direct: resolved.direct,
    },
  });
}

async function preparePreview(
  previewId: string,
  artifact: Artifact | ArtifactPreviewArtifact,
  mode: PreviewMode,
): Promise<ResolvedPreview> {
  await stopPreview(previewId);

  const artifactRoot = await resolveArtifactRoot(artifact);
  const entrypoint = findEntrypoint(artifact, artifactRoot?.entrypoint);

  if (artifactRoot) {
    const server = await serveDirectory(artifactRoot.dir, { host: HOST, port: PORT, entrypoint });
    return {
      url: addEntrypoint(server.url, entrypoint),
      server,
      servedFrom: server.rootDir,
      direct: false,
    };
  }

  const downloadableFiles = getAllDownloadableFiles(artifact, mode);
  if (downloadableFiles.length > 0) {
    const outputDir = path.join(os.tmpdir(), 'codebolt-preview-plugin', previewId);
    await fs.rm(outputDir, { recursive: true, force: true });
    const tempDir = await downloadArtifactFiles(downloadableFiles, { previewId, outputDir });
    const server = await serveDirectory(tempDir, { host: HOST, port: PORT, entrypoint });
    return {
      url: addEntrypoint(server.url, entrypoint),
      server,
      tempDir,
      servedFrom: server.rootDir,
      direct: false,
    };
  }

  const directUrl = getDirectArtifactUrl(artifact as ArtifactPreviewArtifact) || getFallbackDirectUrl(artifact);
  if (directUrl) {
    return {
      url: directUrl,
      direct: true,
    };
  }

  throw new Error('Artifact has no local storagePath, downloadable files, or direct preview URL.');
}

async function resolveArtifactRoot(artifact: Artifact | ArtifactPreviewArtifact): Promise<ArtifactRoot | null> {
  const candidates = [
    getString(artifact, 'storagePath'),
    getString(artifact, 'storage_path'),
    getNestedString(artifact, ['metadata', 'storagePath']),
    getNestedString(artifact, ['metadata', 'storage_path']),
    getNestedString(artifact, ['runtime', 'storagePath']),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = path.resolve(candidate);
    const stat = await fs.stat(resolved).catch(() => null);
    if (stat?.isDirectory()) return { dir: resolved };
    if (stat?.isFile()) {
      return {
        dir: path.dirname(resolved),
        entrypoint: path.basename(resolved),
      };
    }
  }

  return null;
}

function getAllDownloadableFiles(
  artifact: Artifact | ArtifactPreviewArtifact,
  mode: PreviewMode,
): DownloadableArtifactFile[] {
  const normalized = artifact as ArtifactPreviewArtifact;
  const explicit = getDownloadableArtifactFiles(normalized);
  const derived = mode === 'cloud' ? deriveCloudFileUrls(normalized) : [];
  const seen = new Set<string>();
  return [...explicit, ...derived].filter((file) => {
    const key = `${file.relativePath}:${file.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deriveCloudFileUrls(artifact: ArtifactPreviewArtifact): DownloadableArtifactFile[] {
  const files = Array.isArray(artifact.files) ? artifact.files : [];
  if (files.length === 0) return [];

  const baseUrl = getFilesBaseUrl(artifact);
  if (!baseUrl) return [];

  return files
    .map((file, index) => {
      if (typeof file === 'string') {
        return {
          relativePath: sanitizePath(file) || `file-${index}`,
          url: joinUrl(baseUrl, file),
        };
      }

      if (!file || typeof file !== 'object') return null;
      const record = file as Record<string, unknown>;
      const relativePath = sanitizePath(
        firstString([record.relativePath, record.relative_path, record.path, record.name]) || `file-${index}`,
      );
      if (!relativePath) return null;
      const url = firstHttpUrl([
        record.url,
        record.downloadUrl,
        record.download_url,
        record.previewUrl,
        record.preview_url,
        record.signedUrl,
        record.signed_url,
      ]) || joinUrl(baseUrl, relativePath);
      return {
        relativePath,
        url,
        contentType: firstString([record.contentType, record.content_type]),
        size: typeof record.size === 'number' ? record.size : undefined,
      };
    })
    .filter(Boolean) as DownloadableArtifactFile[];
}

function getFilesBaseUrl(artifact: ArtifactPreviewArtifact): string | null {
  const direct = firstHttpUrl([
    artifact.previewUrl,
    artifact.preview_url,
    getNestedString(artifact, ['metadata', 'previewUrl']),
    getNestedString(artifact, ['metadata', 'preview_url']),
  ]);
  if (!direct) return null;

  if (direct.includes('/files/')) {
    return direct.slice(0, direct.indexOf('/files/') + '/files/'.length);
  }

  const artifactId = artifact.id || artifact.artifactId;
  if (artifactId && /\/api\/artifacts\/[^/]+/i.test(direct)) {
    return direct.replace(/\/api\/artifacts\/[^/]+.*/i, `/api/artifacts/${artifactId}/files/`);
  }

  return null;
}

function findEntrypoint(artifact: Artifact | ArtifactPreviewArtifact, fallback?: string): string {
  return (
    getString(artifact, 'entrypoint') ||
    getNestedString(artifact, ['metadata', 'entrypoint']) ||
    getNestedString(artifact, ['runtime', 'entrypoint']) ||
    fallback ||
    inferEntrypointFromFiles(artifact) ||
    'index.html'
  );
}

function inferEntrypointFromFiles(artifact: Artifact | ArtifactPreviewArtifact): string | null {
  const files = Array.isArray((artifact as ArtifactPreviewArtifact).files)
    ? (artifact as ArtifactPreviewArtifact).files || []
    : [];
  const paths = files
    .map((file) => (typeof file === 'string' ? file : file && typeof file === 'object' ? firstString([
      (file as Record<string, unknown>).relativePath,
      (file as Record<string, unknown>).relative_path,
      (file as Record<string, unknown>).path,
      (file as Record<string, unknown>).name,
    ]) : undefined))
    .filter((value): value is string => Boolean(value));

  return (
    paths.find((filePath) => normalizeSlash(filePath).toLowerCase() === 'index.html') ||
    paths.find((filePath) => normalizeSlash(filePath).toLowerCase().endsWith('/index.html')) ||
    paths.find((filePath) => /\.(html?|png|jpe?g|gif|webp|svg|mp4|webm)$/i.test(filePath)) ||
    null
  );
}

function rememberPreview(previewId: string, mode: PreviewMode, resolved: ResolvedPreview): void {
  activePreviews.set(previewId, {
    previewId,
    mode,
    server: resolved.server,
    url: resolved.url,
    tempDir: resolved.tempDir,
  });
}

async function stopPreview(previewId: string): Promise<boolean> {
  const active = activePreviews.get(previewId);
  if (!active) return false;
  activePreviews.delete(previewId);
  await active.server?.close();
  if (active.tempDir) {
    await fs.rm(active.tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
  return true;
}

async function stopAllPreviews(): Promise<void> {
  await Promise.all([...activePreviews.keys()].map((previewId) => stopPreview(previewId)));
}

function shouldStartCloudProvider(): boolean {
  if (!isEnabled(process.env.PREVIEW_CLOUD_ENABLED, true)) return false;
  return Boolean(process.env.PREVIEW_WS_URL || process.env.CODEBOLT_APP_TOKEN || process.env.APP_TOKEN);
}

function isPluginRuntime(): boolean {
  return Boolean(process.env.pluginId || process.env.PLUGIN_DIR || process.env.CODEBOLT_PLUGIN_ID);
}

function installProcessShutdownHandlers(): void {
  const shutdown = async () => {
    await stopEverything();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

function isEnabled(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}

function parsePort(value: string | undefined): number | undefined {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function addEntrypoint(baseUrl: string, entrypoint: string): string {
  const normalized = sanitizePath(entrypoint);
  if (!normalized || normalized === 'index.html') return baseUrl;
  return new URL(normalized, baseUrl).toString();
}

function getFallbackDirectUrl(artifact: Artifact | ArtifactPreviewArtifact): string | null {
  return firstHttpUrl([
    getString(artifact, 'externalUrl'),
    getString(artifact, 'external_url'),
    getString(artifact, 'previewUrl'),
    getString(artifact, 'preview_url'),
    getString(artifact, 'url'),
    getNestedString(artifact, ['runtime', 'url']),
    getNestedString(artifact, ['metadata', 'externalUrl']),
    getNestedString(artifact, ['metadata', 'previewUrl']),
    getNestedString(artifact, ['metadata', 'url']),
  ]);
}

function firstHttpUrl(values: unknown[]): string | null {
  return values.find((value): value is string => typeof value === 'string' && /^https?:\/\//i.test(value)) || null;
}

function firstString(values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function getString(source: unknown, key: string): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getNestedString(source: unknown, keys: string[]): string | undefined {
  let current: unknown = source;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' && current.length > 0 ? current : undefined;
}

function sanitizePath(value: unknown): string {
  const raw = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return raw
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');
}

function normalizeSlash(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function joinUrl(baseUrl: string, relativePath: string): string {
  return new URL(sanitizePath(relativePath), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
