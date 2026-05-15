import fs from 'fs';
import path from 'path';
import { ACT_UPDATED_REFERENCE } from './platformKnowledge';

const ARTIFACT_BLOCKS = {
  agent: 'generate-agent',
  plugin: 'generate-plugin',
  'llm-plugin': 'generate-llm-plugin',
  'websearch-plugin': 'generate-websearch-plugin',
  provider: 'generate-provider',
  'dynamic-panel': 'generate-dynamic-panel',
  'custom-ui': 'generate-custom-ui',
  'action-block': 'generate-action-block',
};

const DEFAULT_DIRECTORIES = {
  agent: '.codebolt/agents',
  plugin: '.codebolt/plugins',
  'llm-plugin': '.codebolt/plugins',
  'websearch-plugin': '.codebolt/plugins',
  provider: '.codebolt/providers',
  'dynamic-panel': '.codebolt/plugins',
  'custom-ui': '.codebolt/plugins',
  'action-block': '.codebolt/actionblocks',
};

function getAgentRoot() {
  const distRoot = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(distRoot, 'action-blocks'))) {
    return distRoot;
  }
  return path.resolve(__dirname, '..');
}

function getActionBlockPath(blockName) {
  return path.join(getAgentRoot(), 'action-blocks', blockName);
}

function getActionBlockInvocationNames(blockName) {
  return [
    `platformMofier-${blockName}`,
    `platform-${blockName}`,
    blockName,
  ];
}

function slugifyName(value, fallback) {
  const slug = String(value || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return slug || fallback;
}

function hasArtifactCreationIntent(text) {
  const lower = String(text || '').toLowerCase();
  const hasCreationVerb = /\b(create|generate|build|scaffold|implement|add|make|produce|prepare|write|setup|set up|need|want)\b/.test(lower);
  const hasPlatformSurface = /\b(agent|plugin|extension|provider|dynamic panel|panel plugin|dynamic ui|custom ui|frontend plugin|action\s*block|actionblock|web\s*search|websearch|llm|model provider|custom model|completion provider|remote environment|environment provider|e2b)\b/.test(lower);
  return hasCreationVerb && hasPlatformSurface;
}

function inferArtifactsFromText(text) {
  const lower = text.toLowerCase();
  const artifacts = [];
  if (!hasArtifactCreationIntent(text)) {
    return artifacts;
  }

  const isAgentRequest = /\bagent\b/.test(lower);
  const isFeatureAwarenessRequest = /\b(aware|awareness|knowledge|capability|capabilities|support|supports|understand|understands)\b/.test(lower);
  const explicitlyRequestsDynamicPanel = /\b(dynamic panel|panel plugin)\b/.test(lower)
    || (/\bdynamic ui\b/.test(lower) && (!isAgentRequest || /\b(plugin|artifact|panel)\b/.test(lower)));
  const explicitlyRequestsCustomUi = /\b(custom ui|ui plugin|frontend plugin)\b/.test(lower)
    || (/\bui\b/.test(lower) && /\b(plugin|artifact)\b/.test(lower) && !isFeatureAwarenessRequest);

  const add = (artifactType, fallbackName, description) => {
    if (!artifacts.some((artifact) => artifact.artifactType === artifactType)) {
      artifacts.push({ artifactType, name: fallbackName, description, features: [] });
    }
  };

  if (/\b(action\s*block|actionblock)\b/.test(lower)) {
    add('action-block', 'generated-action-block', 'Reusable CodeBolt ActionBlock');
  }
  if (/\b(web\s*search|websearch|search provider)\b/.test(lower)) {
    add('websearch-plugin', 'generated-websearch-plugin', 'Custom web search provider plugin');
  }
  if (/\b(llm|model provider|custom model|completion provider)\b/.test(lower)) {
    add('llm-plugin', 'generated-llm-plugin', 'Custom LLM provider plugin');
  }
  if (explicitlyRequestsDynamicPanel && !(isAgentRequest && isFeatureAwarenessRequest && !/\b(plugin|artifact|panel plugin)\b/.test(lower))) {
    add('dynamic-panel', 'generated-dynamic-panel', 'Dynamic panel plugin');
  }
  if (explicitlyRequestsCustomUi && !(isAgentRequest && isFeatureAwarenessRequest && !/\b(plugin|artifact|ui plugin|frontend plugin)\b/.test(lower))) {
    add('custom-ui', 'generated-custom-ui', 'Custom UI plugin');
  }
  if (/\b(provider|remote environment|environment provider|e2b)\b/.test(lower) && !/\bllm|web\s*search|websearch\b/.test(lower)) {
    add('provider', 'generated-provider', 'Environment provider');
  }
  if (/\b(plugin|extension)\b/.test(lower) && artifacts.length === 0) {
    add('plugin', 'generated-plugin', 'CodeBolt plugin');
  }
  if (/\bagent\b/.test(lower) || (artifacts.length === 0 && hasArtifactCreationIntent(text))) {
    add('agent', 'generated-agent', 'CodeBolt agent');
  }

  const quotedNameMatch = text.match(/\b(?:named|called|name)\s+["'`]([^"'`]{2,80})["'`]/i);
  const unquotedNameMatch = text.match(/\b(?:named|called|name)\s+([A-Za-z0-9_.-]{2,80})/i);
  const requestedName = quotedNameMatch ? quotedNameMatch[1] : unquotedNameMatch && unquotedNameMatch[1];
  if (requestedName && artifacts.length === 1) {
    artifacts[0].name = slugifyName(requestedName, artifacts[0].name);
  }

  return artifacts;
}

function normalizeArtifact(rawArtifact, projectPath, userText) {
  const artifactType = rawArtifact.artifactType;
  if (!ARTIFACT_BLOCKS[artifactType]) {
    throw new Error(`Unsupported artifact type: ${artifactType}`);
  }

  const name = slugifyName(rawArtifact.name, `generated-${artifactType}`);
  const relativeBaseDir = DEFAULT_DIRECTORIES[artifactType];
  const targetDirectory = rawArtifact.targetDirectory
    ? path.resolve(projectPath, rawArtifact.targetDirectory)
    : path.join(projectPath, relativeBaseDir, name);

  return {
    artifactType,
    name,
    description: rawArtifact.description || `Generated CodeBolt ${artifactType}`,
    features: Array.isArray(rawArtifact.features) ? rawArtifact.features : [],
    targetDirectory,
    projectPath,
    originalRequest: userText,
    agentLoopReference: ACT_UPDATED_REFERENCE,
    referencePaths: Array.isArray(rawArtifact.referencePaths) ? rawArtifact.referencePaths : [],
    constraints: [
      'Generate TypeScript source in src/index.ts and runtime output in dist/index.js.',
      'Use ESM import syntax in TypeScript source; compiled dist may be CommonJS.',
      'Use published npm package versions only; never use file:, link:, workspace:, or absolute local dependencies.',
      'Do not write machine-specific local paths, development repo paths, or user-home paths into generated source, manifests, package files, or README.',
      'Keep every artifact self-contained; do not depend on centralized shared generator logic from PlatformMofier.',
      'README.md must include Run and Testing sections with dependency install/build commands, CodeBolt load or restart steps, the correct CodeBolt testing tools, and artifact-specific runtime smoke checks.',
      ...(Array.isArray(rawArtifact.constraints) ? rawArtifact.constraints.map(String) : []),
    ],
    generationContext: {
      publisherSafe: true,
      sourceLanguage: 'TypeScript',
      runtimeEntry: 'dist/index.js',
      sourceEntry: 'src/index.ts',
      dependencyPolicy: 'published npm packages only',
      localReferencePolicy: 'no generated local filesystem or development repository references',
      actionBlockModel: 'each ActionBlock is an independent mini-agent with plan, write, verify, and repair phases',
    },
  };
}

export {
  ARTIFACT_BLOCKS,
  getActionBlockInvocationNames,
  getActionBlockPath,
  hasArtifactCreationIntent,
  inferArtifactsFromText,
  normalizeArtifact,
};
