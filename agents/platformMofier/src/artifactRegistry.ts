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
  tool: 'generate-tool',
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
  tool: '.codebolt/tools',
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

function getArtifactAliasSlugs(artifactType) {
  const aliases = {
    agent: ['agent'],
    plugin: ['plugin', 'extension'],
    'llm-plugin': ['llm-plugin', 'model-provider', 'completion-provider'],
    'websearch-plugin': ['websearch-plugin', 'web-search-plugin', 'search-provider'],
    provider: ['provider', 'environment-provider'],
    'dynamic-panel': ['dynamic-panel', 'panel-plugin', 'dynamic-ui'],
    'custom-ui': ['custom-ui', 'ui-plugin', 'frontend-plugin'],
    'action-block': ['action-block', 'actionblock'],
    tool: ['tool', 'mcp-tool', 'local-tool', 'project-tool', 'codebolt-tool'],
  };
  return aliases[artifactType] || [slugifyName(artifactType, 'artifact')];
}

function isGenericArtifactName(value, artifactType) {
  const slug = slugifyName(value, '');
  if (!slug) {
    return true;
  }

  const genericPrefixes = ['', 'generated', 'new', 'custom', 'generic', 'reusable', 'codebolt', 'reusable-codebolt'];
  for (const alias of getArtifactAliasSlugs(artifactType)) {
    for (const prefix of genericPrefixes) {
      if (slug === (prefix ? `${prefix}-${alias}` : alias)) {
        return true;
      }
    }
  }

  return false;
}

function titleCase(value) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getMeaningfulFullName(rawArtifact, name, artifactType) {
  const suppliedName = rawArtifact.fullName || rawArtifact.displayName || rawArtifact.meaningfulFullName;
  if (suppliedName && !isGenericArtifactName(suppliedName, artifactType)) {
    return String(suppliedName);
  }

  return titleCase(name) || `Generated ${titleCase(artifactType)}`;
}

function getMeaningfulNameHint(value, artifactType) {
  return value && !isGenericArtifactName(value, artifactType) ? String(value) : '';
}

function normalizeFeature(feature) {
  if (typeof feature === 'string') {
    const name = slugifyName(feature, 'feature');
    return {
      name,
      fullName: titleCase(feature),
      description: String(feature),
    };
  }

  if (feature && typeof feature === 'object') {
    const name = slugifyName(feature.name || feature.fullName || feature.description, 'feature');
    return {
      name,
      fullName: String(feature.fullName || feature.displayName || titleCase(name)),
      description: String(feature.description || feature.fullName || feature.name || titleCase(name)),
    };
  }

  return {
    name: 'feature',
    fullName: 'Feature',
    description: 'Feature',
  };
}

function hasArtifactCreationIntent(text) {
  const lower = String(text || '').toLowerCase();
  const hasCreationVerb = /\b(create|generate|build|scaffold|implement|add|make|produce|prepare|write|setup|set up|need|want)\b/.test(lower);
  const hasPlatformSurface = /\b(agent|plugin|extension|provider|dynamic panel|panel plugin|dynamic ui|custom ui|frontend plugin|action\s*block|actionblock|tool|tools|mcp\s*tool|local\s*tool|project\s*tool|codebolt\s*tool|web\s*search|websearch|llm|model provider|custom model|completion provider|remote environment|environment provider|e2b)\b/.test(lower);
  return hasCreationVerb && hasPlatformSurface;
}

function getArtifactSurfacePattern(artifactType) {
  const surfaces = {
    agent: '(?:codebolt\\s+)?agent',
    plugin: '(?:plugin|extension)',
    'llm-plugin': '(?:llm\\s+plugin|model\\s+provider|completion\\s+provider|custom\\s+model)',
    'websearch-plugin': '(?:web\\s*search\\s+plugin|websearch\\s+plugin|web\\s*search\\s+provider|search\\s+provider)',
    provider: '(?:provider|remote\\s+environment|environment\\s+provider|e2b)',
    'dynamic-panel': '(?:dynamic\\s+panel|panel\\s+plugin|dynamic\\s+ui)',
    'custom-ui': '(?:custom\\s+ui|ui\\s+plugin|frontend\\s+plugin)',
    'action-block': '(?:action\\s*block|actionblock)',
    tool: '(?:(?:codebolt|mcp|local|project)\\s+)?tools?',
  };
  return surfaces[artifactType] || String(artifactType).replace(/-/g, '\\s+');
}

function extractRequestedName(text) {
  const quotedNameMatch = text.match(/\b(?:named|called|name)\s+["'`]([^"'`]{2,80})["'`]/i);
  const unquotedNameMatch = text.match(/\b(?:named|called|name)\s+([A-Za-z0-9_.-]{2,80})/i);
  return quotedNameMatch ? quotedNameMatch[1] : unquotedNameMatch && unquotedNameMatch[1];
}

function cleanConceptForName(concept, artifactType) {
  const artifactWords = getArtifactAliasSlugs(artifactType).flatMap((alias) => alias.split('-'));
  const stopWords = new Set([
    ...artifactWords,
    'a', 'an', 'the', 'and', 'or', 'of', 'for', 'to', 'from', 'in', 'on', 'with', 'by', 'as',
    'that', 'which', 'who', 'can', 'could', 'should', 'must', 'will', 'would', 'able',
    'create', 'generate', 'build', 'scaffold', 'implement', 'add', 'make', 'produce',
    'prepare', 'write', 'setup', 'set', 'up', 'need', 'want', 'please',
    'codebolt', 'custom', 'reusable', 'generated', 'generic', 'new', 'side', 'execution', 'artifact',
    'user', 'requirement', 'requirements',
  ]);

  const words = String(concept || '')
    .replace(/["'`]/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => {
      const lower = word.toLowerCase();
      return lower.length > 1 && !stopWords.has(lower);
    })
    .slice(0, 8);

  return slugifyName(words.join(' '), '');
}

function deriveMeaningfulNameFromText(text, artifactType, fallback) {
  const requestedName = extractRequestedName(String(text || ''));
  if (requestedName) {
    return slugifyName(requestedName, fallback);
  }

  const source = String(text || '').replace(/\s+/g, ' ').trim();
  const surface = getArtifactSurfacePattern(artifactType);
  const afterSurface = source.match(new RegExp(`${surface}\\s+(?:for|to|that|which|with|using|as)?\\s*([^.!?\\n]{3,180})`, 'i'));
  const beforeSurface = source.match(new RegExp(`(?:create|generate|build|scaffold|implement|add|make|produce|prepare|write|setup|set\\s+up|need|want)\\s+([^.!?\\n]{3,120}?)\\s+${surface}`, 'i'));
  const concept = (afterSurface && afterSurface[1]) || (beforeSurface && beforeSurface[1]) || source;
  const derivedName = cleanConceptForName(concept, artifactType);

  return derivedName || fallback;
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
      const name = deriveMeaningfulNameFromText(text, artifactType, fallbackName);
      artifacts.push({ artifactType, name, fullName: titleCase(name), description, features: [] });
    }
  };

  if (/\b(action\s*block|actionblock)\b/.test(lower)) {
    add('action-block', 'generated-action-block', 'Reusable CodeBolt ActionBlock');
  }
  if (/\b((?:codebolt|mcp|local|project)\s+)?tools?\b/.test(lower) && !/\b(plugin|extension)\b/.test(lower)) {
    add('tool', 'generated-tool', 'CodeBolt local MCP tool');
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

  const requestedName = extractRequestedName(text);
  if (requestedName && artifacts.length === 1) {
    artifacts[0].name = slugifyName(requestedName, artifacts[0].name);
    artifacts[0].fullName = titleCase(artifacts[0].name);
  }

  return artifacts;
}

function normalizeArtifact(rawArtifact, projectPath, userText) {
  const artifactType = rawArtifact.artifactType;
  if (!ARTIFACT_BLOCKS[artifactType]) {
    throw new Error(`Unsupported artifact type: ${artifactType}`);
  }

  const fallbackName = `generated-${artifactType}`;
  const suppliedName = slugifyName(rawArtifact.name, '');
  const nameDerivationSource = [
    userText,
    getMeaningfulNameHint(rawArtifact.fullName, artifactType),
    getMeaningfulNameHint(rawArtifact.displayName, artifactType),
    getMeaningfulNameHint(rawArtifact.meaningfulFullName, artifactType),
    getMeaningfulNameHint(rawArtifact.description, artifactType),
  ].filter(Boolean).join(' ');
  const name = suppliedName && !isGenericArtifactName(suppliedName, artifactType)
    ? suppliedName
    : deriveMeaningfulNameFromText(nameDerivationSource, artifactType, fallbackName);
  const fullName = getMeaningfulFullName(rawArtifact, name, artifactType);
  const relativeBaseDir = DEFAULT_DIRECTORIES[artifactType];
  const targetDirectory = rawArtifact.targetDirectory
    ? path.resolve(projectPath, rawArtifact.targetDirectory)
    : path.join(projectPath, relativeBaseDir, name);
  const baseConstraints = artifactType === 'tool'
    ? [
      'Generate codebolttool.yaml and a root index.js file because the server loads local tools from .codebolt/tools/<name>/index.js.',
      'The root index.js must start a stdio MCP server and expose at least one callable tool through listTools/callTool.',
      'Keep optional TypeScript/build files self-contained if generated, but do not make CodeBolt depend on dist/index.js for tool loading.',
    ]
    : [
      'Generate TypeScript source in src/index.ts and runtime output in dist/index.js.',
      'Use ESM import syntax in TypeScript source; compiled dist may be CommonJS.',
    ];

  return {
    artifactType,
    name,
    fullName,
    displayName: fullName,
    description: rawArtifact.description || `Generated CodeBolt ${artifactType}`,
    features: Array.isArray(rawArtifact.features) ? rawArtifact.features.map(normalizeFeature) : [],
    targetDirectory,
    projectPath,
    originalRequest: userText,
    agentLoopReference: ACT_UPDATED_REFERENCE,
    referencePaths: Array.isArray(rawArtifact.referencePaths) ? rawArtifact.referencePaths : [],
    constraints: [
      ...baseConstraints,
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
