import codebolt from '@codebolt/codeboltjs';
import type {
  ActionBlockInvocationMetadata,
  ArtifactCreatorParams,
  ArtifactFileInput,
  ArtifactRuntime,
  ArtifactType,
  CreateArtifactInput,
  CreateArtifactResult,
} from './types';

const ACTION_BLOCK_NAME = 'create-artifact';

const ARTIFACT_TYPES = new Set<ArtifactType>([
  'static_site',
  'dynamic_site',
  'image',
  'video',
  'native_application',
  'terminal_application',
  'url',
  'file',
  'other',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireString(value: unknown, fieldName: string): string {
  const normalized = getString(value);
  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }
  return normalized;
}

function optionalRecord(value: unknown, fieldName: string): Record<string, unknown> | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}

function optionalStringArray(value: unknown, fieldName: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of strings`);
  }

  return value.map((item, index) => requireString(item, `${fieldName}[${index}]`));
}

function optionalNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  return value;
}

function normalizeArtifactType(value: unknown): ArtifactType {
  const type = requireString(value, 'type') as ArtifactType;
  if (!ARTIFACT_TYPES.has(type)) {
    throw new Error(`Unsupported artifact type: ${type}`);
  }
  return type;
}

function normalizeFiles(value: unknown): ArtifactFileInput[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('files must be an array');
  }

  return value.map((file, index) => {
    if (!isRecord(file)) {
      throw new Error(`files[${index}] must be an object`);
    }

    const path = requireString(file.path, `files[${index}].path`);
    const content = file.content;
    if (typeof content !== 'string') {
      throw new Error(`files[${index}].content must be a string`);
    }

    const encoding = file.encoding;
    if (encoding !== undefined && encoding !== 'utf8' && encoding !== 'base64') {
      throw new Error(`files[${index}].encoding must be "utf8" or "base64"`);
    }

    return {
      path,
      content,
      encoding: encoding as ArtifactFileInput['encoding'],
    };
  });
}

function normalizeRuntime(value: unknown): ArtifactRuntime | undefined {
  const runtime = optionalRecord(value, 'runtime');
  if (!runtime) return undefined;

  const normalized: ArtifactRuntime = {
    command: getString(runtime.command),
    args: optionalStringArray(runtime.args, 'runtime.args'),
    cwd: getString(runtime.cwd),
    port: optionalNumber(runtime.port, 'runtime.port'),
    url: getString(runtime.url),
  };

  return Object.values(normalized).some((item) => item !== undefined) ? normalized : undefined;
}

function compact<T extends object>(value: T): T {
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (item !== undefined) {
      next[key] = item;
    }
  }
  return next as T;
}

function getParams(threadContext: unknown): ArtifactCreatorParams {
  const context = isRecord(threadContext) ? threadContext : {};
  const params = isRecord(context.params) ? context.params : {};
  const artifact = isRecord(params.artifact) ? params.artifact : {};

  return {
    ...artifact,
    ...params,
  } as ArtifactCreatorParams;
}

function buildMetadata(
  params: ArtifactCreatorParams,
  invocationMetadata: ActionBlockInvocationMetadata,
): Record<string, unknown> {
  const suppliedMetadata = optionalRecord(params.metadata, 'metadata') || {};

  return {
    ...suppliedMetadata,
    artifactCreator: {
      actionBlock: ACTION_BLOCK_NAME,
      sideExecutionId: invocationMetadata.sideExecutionId,
      parentAgentId: invocationMetadata.parentAgentId,
      parentAgentInstanceId: invocationMetadata.parentAgentInstanceId,
      invokedAt: invocationMetadata.timestamp || new Date().toISOString(),
    },
  };
}

function buildCreateArtifactInput(
  params: ArtifactCreatorParams,
  invocationMetadata: ActionBlockInvocationMetadata,
): CreateArtifactInput {
  const runtime = normalizeRuntime(params.runtime);
  const externalUrl = getString(params.externalUrl) || getString(params.url);
  const type = normalizeArtifactType(params.type);

  if (type === 'url' && !externalUrl && !runtime?.url) {
    throw new Error('URL artifacts require externalUrl, url, or runtime.url');
  }

  return compact<CreateArtifactInput>({
    type,
    title: requireString(params.title, 'title'),
    description: getString(params.description),
    entrypoint: getString(params.entrypoint),
    externalUrl,
    externalProvider: getString(params.externalProvider),
    externalResourceId: getString(params.externalResourceId),
    expiresAt: getString(params.expiresAt),
    files: normalizeFiles(params.files),
    sourcePath: getString(params.sourcePath),
    metadata: buildMetadata(params, invocationMetadata),
    runtime,
    agentId: getString(params.agentId) || invocationMetadata.parentAgentId,
    agentName: getString(params.agentName),
    agentInstanceId: getString(params.agentInstanceId) || invocationMetadata.parentAgentInstanceId,
    threadId: getString(params.threadId) || invocationMetadata.threadId,
    parentAgentInstanceId: getString(params.parentAgentInstanceId),
    parentId: getString(params.parentId),
    reviewMergeRequestId: getString(params.reviewMergeRequestId),
  });
}

codebolt.onActionBlockInvocation(
  async (threadContext: unknown, metadata: ActionBlockInvocationMetadata): Promise<CreateArtifactResult> => {
    try {
      const params = getParams(threadContext);
      const artifactInput = buildCreateArtifactInput(params, metadata || {});

      codebolt.chat.sendMessage(`Creating artifact "${artifactInput.title}" (${artifactInput.type})`, {});

      const response = await codebolt.artifact.create(artifactInput);
      const artifact = response.artifact;
      const message = `Created artifact ${artifact.id}: ${artifact.title}`;

      codebolt.chat.sendMessage(message, {});

      return {
        success: true,
        artifactId: artifact.id,
        artifact,
        previewUrl: artifact.previewUrl,
        externalUrl: artifact.externalUrl,
        files: artifact.files,
        totalFiles: artifact.files.length,
        message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      codebolt.chat.sendMessage(`Artifact creation failed: ${errorMessage}`, {});

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
);

export * from './types';
