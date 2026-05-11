import plugin from '@codebolt/plugin-sdk';
import type { Artifact, ArtifactPreviewRequest } from '@codebolt/plugin-sdk';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';

const PROVIDER_ID = process.env.WINDOWS_SANDBOX_PREVIEW_PROVIDER_ID || 'codebolt-windows-sandbox-preview';
const PROVIDER_NAME = process.env.WINDOWS_SANDBOX_PREVIEW_PROVIDER_NAME || 'Windows Sandbox Preview';
const SANDBOX_FOLDER = 'C:\\CodeBoltArtifact';
const SCRIPT_FOLDER = 'C:\\CodeBoltPreviewScripts';

interface ActivePreview {
  previewId: string;
  statusUrl: string;
  hostArtifactPath: string;
  wsbPath: string;
  scriptPath: string;
  server: Server;
}

const activePreviews = new Map<string, ActivePreview>();

plugin.onStart(async () => {
  await plugin.artifact.registerPreviewProvider({
    providerId: PROVIDER_ID,
    name: PROVIDER_NAME,
    artifactTypes: ['native_application'] as any,
    description: 'Runs native Windows artifacts in Windows Sandbox with the artifact folder mapped into the sandbox.',
  });

  plugin.artifact.onPreviewRequest(handlePreviewRequest);
  console.log(`[windowsSandboxPreview] Registered local preview provider ${PROVIDER_ID}`);
});

plugin.onStop(async () => {
  await Promise.all([...activePreviews.values()].map((preview) => closePreview(preview.previewId)));
});

async function handlePreviewRequest(request: ArtifactPreviewRequest): Promise<void> {
  const { previewId, artifact } = request;
  try {
    plugin.artifact.acknowledgePreview(previewId, 'Preparing Windows Sandbox preview...');
    await closePreview(previewId);

    ensureWindowsHost();
    ensureWindowsSandboxAvailable();

    const artifactRoot = await resolveArtifactRoot(artifact);
    if (!artifactRoot) {
      throw new Error('Artifact does not have a local storagePath that can be mapped into Windows Sandbox.');
    }

    const workDir = path.join(os.tmpdir(), 'codebolt-windows-sandbox-preview', previewId);
    await fs.rm(workDir, { recursive: true, force: true });
    await fs.mkdir(workDir, { recursive: true });

    const launchCommand = resolveLaunchCommand(artifact, artifactRoot.entrypoint);
    const scriptPath = path.join(workDir, 'CodeBoltLaunch.ps1');
    const wsbPath = path.join(workDir, 'CodeBoltPreview.wsb');
    await fs.writeFile(scriptPath, buildLaunchScript(artifact, launchCommand, artifactRoot.entrypoint), 'utf8');
    await fs.writeFile(wsbPath, buildWsbConfig(artifact, artifactRoot.dir, workDir), 'utf8');

    launchWindowsSandbox(wsbPath);

    const server = await startStatusServer({
      previewId,
      artifact,
      artifactRoot: artifactRoot.dir,
      launchCommand,
      wsbPath,
      scriptPath,
    });

    const active: ActivePreview = {
      previewId,
      statusUrl: server.url,
      hostArtifactPath: artifactRoot.dir,
      wsbPath,
      scriptPath,
      server: server.server,
    };
    activePreviews.set(previewId, active);

    plugin.artifact.sendPreviewReady(
      previewId,
      {
        kind: 'url',
        url: active.statusUrl,
        openIn: 'artifact_panel',
        label: 'Windows Sandbox Preview',
        message: 'Windows Sandbox launched. Close the Sandbox window to stop the preview.',
      } as any,
      'Windows Sandbox launched.',
    );
  } catch (error) {
    plugin.artifact.sendPreviewError(previewId, errorMessage(error), 'Failed to start Windows Sandbox preview.');
  }
}

async function resolveArtifactRoot(artifact: Artifact): Promise<{ dir: string; entrypoint?: string } | null> {
  const candidates = [
    getString((artifact as any).storagePath),
    getString((artifact as any).storage_path),
    getString((artifact as any).metadata?.storagePath),
    getString((artifact as any).metadata?.storage_path),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = path.resolve(candidate);
    const stat = await fs.stat(resolved).catch(() => null);
    if (stat?.isDirectory()) return { dir: resolved, entrypoint: sanitizeRelativePath(artifact.entrypoint) || undefined };
    if (stat?.isFile()) return { dir: path.dirname(resolved), entrypoint: path.basename(resolved) };
  }

  return null;
}

function buildWsbConfig(artifact: Artifact, artifactHostPath: string, scriptHostPath: string): string {
  const metadata = ((artifact as any).metadata || {}) as Record<string, unknown>;
  const networking = getSandboxSetting(metadata.windowsSandboxNetworking, 'Disable');
  const vgpu = getSandboxSetting(metadata.windowsSandboxVGpu, 'Enable');
  const clipboard = getSandboxSetting(metadata.windowsSandboxClipboard, 'Disable');
  const protectedClient = getSandboxSetting(metadata.windowsSandboxProtectedClient, 'Enable');
  const readOnly = metadata.windowsSandboxReadOnly === false ? 'false' : 'true';
  const memoryMb = getNumber(metadata.windowsSandboxMemoryMb);

  return [
    '<Configuration>',
    `  <VGpu>${xmlEscape(vgpu)}</VGpu>`,
    `  <Networking>${xmlEscape(networking)}</Networking>`,
    `  <ClipboardRedirection>${xmlEscape(clipboard)}</ClipboardRedirection>`,
    `  <ProtectedClient>${xmlEscape(protectedClient)}</ProtectedClient>`,
    memoryMb ? `  <MemoryInMB>${memoryMb}</MemoryInMB>` : '',
    '  <MappedFolders>',
    '    <MappedFolder>',
    `      <HostFolder>${xmlEscape(artifactHostPath)}</HostFolder>`,
    `      <SandboxFolder>${SANDBOX_FOLDER}</SandboxFolder>`,
    `      <ReadOnly>${readOnly}</ReadOnly>`,
    '    </MappedFolder>',
    '    <MappedFolder>',
    `      <HostFolder>${xmlEscape(scriptHostPath)}</HostFolder>`,
    `      <SandboxFolder>${SCRIPT_FOLDER}</SandboxFolder>`,
    '      <ReadOnly>true</ReadOnly>',
    '    </MappedFolder>',
    '  </MappedFolders>',
    '  <LogonCommand>',
    `    <Command>powershell.exe -NoProfile -ExecutionPolicy Bypass -File ${SCRIPT_FOLDER}\\CodeBoltLaunch.ps1</Command>`,
    '  </LogonCommand>',
    '</Configuration>',
    '',
  ].filter(Boolean).join('\n');
}

function buildLaunchScript(artifact: Artifact, launchCommand: string | null, entrypoint?: string): string {
  const title = artifact.title || 'CodeBolt Artifact';
  const entrypointPath = entrypoint ? `${SANDBOX_FOLDER}\\${entrypoint.replace(/\//g, '\\')}` : '';

  return [
    '$ErrorActionPreference = "Continue"',
    `[Console]::Title = ${psSingleQuote(`CodeBolt Preview - ${title}`)}`,
    `$ArtifactRoot = ${psSingleQuote(SANDBOX_FOLDER)}`,
    `$Entrypoint = ${psSingleQuote(entrypointPath)}`,
    `$LaunchCommand = ${psHereString(launchCommand || '')}`,
    'Set-Location $ArtifactRoot',
    'Write-Host "CodeBolt Windows Sandbox Preview"',
    'Write-Host "Artifact: $ArtifactRoot"',
    'if ($LaunchCommand.Trim()) {',
    '  Write-Host "Running launch command..."',
    '  Start-Process powershell.exe -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $LaunchCommand) -WorkingDirectory $ArtifactRoot',
    '} elseif ($Entrypoint -and (Test-Path $Entrypoint)) {',
    '  Write-Host "Opening entrypoint $Entrypoint"',
    '  $extension = [System.IO.Path]::GetExtension($Entrypoint).ToLowerInvariant()',
    '  if ($extension -eq ".ps1") {',
    '    Start-Process powershell.exe -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $Entrypoint) -WorkingDirectory (Split-Path $Entrypoint -Parent)',
    '  } elseif ($extension -eq ".cmd" -or $extension -eq ".bat") {',
    '    Start-Process cmd.exe -ArgumentList @("/k", $Entrypoint) -WorkingDirectory (Split-Path $Entrypoint -Parent)',
    '  } elseif ($extension -eq ".msi") {',
    '    Start-Process msiexec.exe -ArgumentList @("/i", $Entrypoint) -WorkingDirectory (Split-Path $Entrypoint -Parent)',
    '  } else {',
    '    Start-Process $Entrypoint -WorkingDirectory (Split-Path $Entrypoint -Parent)',
    '  }',
    '} else {',
    '  Write-Host "No launch command or entrypoint found. Opening artifact folder."',
    '  Start-Process explorer.exe $ArtifactRoot',
    '}',
  ].join('\r\n');
}

function resolveLaunchCommand(artifact: Artifact, fallbackEntrypoint?: string): string | null {
  const metadata = ((artifact as any).metadata || {}) as Record<string, unknown>;
  const explicit =
    getString(metadata.windowsSandboxCommand) ||
    getString(metadata.sandboxCommand) ||
    getString(metadata.launchCommand);
  if (explicit) return explicit;

  const runtime = (artifact as any).runtime || {};
  const command = getString(runtime.command);
  if (command) {
    const args = Array.isArray(runtime.args) ? runtime.args.map((arg: unknown) => psCommandQuote(String(arg))) : [];
    return [command, ...args].join(' ');
  }

  const entrypoint = sanitizeRelativePath(artifact.entrypoint || fallbackEntrypoint);
  if (!entrypoint) return null;
  const sandboxEntrypoint = `${SANDBOX_FOLDER}\\${entrypoint.replace(/\//g, '\\')}`;
  const ext = path.extname(entrypoint).toLowerCase();
  if (ext === '.ps1') return `powershell.exe -NoExit -ExecutionPolicy Bypass -File ${psCommandQuote(sandboxEntrypoint)}`;
  if (ext === '.cmd' || ext === '.bat') return `cmd.exe /k ${psCommandQuote(sandboxEntrypoint)}`;
  if (ext === '.msi') return `msiexec.exe /i ${psCommandQuote(sandboxEntrypoint)}`;
  return psCommandQuote(sandboxEntrypoint);
}

async function startStatusServer(options: {
  previewId: string;
  artifact: Artifact;
  artifactRoot: string;
  launchCommand: string | null;
  wsbPath: string;
  scriptPath: string;
}): Promise<{ server: Server; url: string }> {
  const server = createServer((_, response) => {
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    });
    response.end(renderStatusPage(options));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return { server, url: `http://127.0.0.1:${port}/` };
}

function renderStatusPage(options: {
  previewId: string;
  artifact: Artifact;
  artifactRoot: string;
  launchCommand: string | null;
  wsbPath: string;
  scriptPath: string;
}): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Windows Sandbox Preview</title>
  <style>
    body { margin: 0; background: #0f1115; color: #e5e7eb; font: 13px/1.5 system-ui, sans-serif; }
    main { max-width: 760px; margin: 0 auto; padding: 28px; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    .card { border: 1px solid #2a2f3a; border-radius: 8px; padding: 16px; background: #151922; }
    .label { color: #9ca3af; font-size: 11px; text-transform: uppercase; margin-top: 12px; }
    code { display: block; white-space: pre-wrap; word-break: break-all; background: #0b0d12; border: 1px solid #252a34; padding: 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <main>
    <h1>Windows Sandbox launched</h1>
    <div class="card">
      <div>Close the Windows Sandbox window to stop this preview. The sandbox is disposable; changes inside it are discarded unless you explicitly map writable folders.</div>
      <div class="label">Artifact</div>
      <code>${htmlEscape(options.artifact.title || options.artifact.id || 'Artifact')}</code>
      <div class="label">Mapped Host Folder</div>
      <code>${htmlEscape(options.artifactRoot)}</code>
      <div class="label">Launch Command</div>
      <code>${htmlEscape(options.launchCommand || 'Open artifact folder')}</code>
      <div class="label">Generated WSB</div>
      <code>${htmlEscape(options.wsbPath)}</code>
      <div class="label">Generated Script</div>
      <code>${htmlEscape(options.scriptPath)}</code>
      <div class="label">Preview ID</div>
      <code>${htmlEscape(options.previewId)}</code>
    </div>
  </main>
</body>
</html>`;
}

function launchWindowsSandbox(wsbPath: string): void {
  const child = spawn('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    '& { param($Path) Start-Process -FilePath $Path }',
    wsbPath,
  ], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

async function closePreview(previewId: string): Promise<void> {
  const active = activePreviews.get(previewId);
  if (!active) return;
  activePreviews.delete(previewId);
  await new Promise<void>((resolve) => active.server.close(() => resolve()));
}

function ensureWindowsHost(): void {
  if (process.platform !== 'win32') {
    throw new Error('Windows Sandbox preview requires a Windows host.');
  }
}

function ensureWindowsSandboxAvailable(): void {
  const sandboxExe = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsSandbox.exe');
  if (!existsSync(sandboxExe)) {
    throw new Error('WindowsSandbox.exe was not found. Enable the Windows Sandbox optional feature on this machine.');
  }
}

function getSandboxSetting(value: unknown, fallback: 'Enable' | 'Disable' | 'Default'): 'Enable' | 'Disable' | 'Default' {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'enable' || normalized === 'enabled' || value === true) return 'Enable';
  if (normalized === 'disable' || normalized === 'disabled' || value === false) return 'Disable';
  if (normalized === 'default') return 'Default';
  return fallback;
}

function getNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function sanitizeRelativePath(value: unknown): string {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');
}

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function psSingleQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function psHereString(value: string): string {
  return `@'\r\n${value.replace(/'@/g, "' + '@' + '")}\r\n'@`;
}

function psCommandQuote(value: string): string {
  if (!/[ \t"'`$;&|<>()[\]{}]/.test(value)) return value;
  return `"${value.replace(/`/g, '``').replace(/"/g, '`"')}"`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
