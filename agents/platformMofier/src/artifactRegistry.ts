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

function inferArtifactsFromText(text) {
  const lower = text.toLowerCase();
  const artifacts = [];

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
  if (/\b(dynamic panel|panel plugin|dynamic ui)\b/.test(lower)) {
    add('dynamic-panel', 'generated-dynamic-panel', 'Dynamic panel plugin');
  }
  if (/\b(custom ui|ui plugin|frontend plugin)\b/.test(lower)) {
    add('custom-ui', 'generated-custom-ui', 'Custom UI plugin');
  }
  if (/\b(provider|remote environment|environment provider|e2b)\b/.test(lower) && !/\bllm|web\s*search|websearch\b/.test(lower)) {
    add('provider', 'generated-provider', 'Environment provider');
  }
  if (/\b(plugin|extension)\b/.test(lower) && artifacts.length === 0) {
    add('plugin', 'generated-plugin', 'CodeBolt plugin');
  }
  if (/\bagent\b/.test(lower) || artifacts.length === 0) {
    add('agent', 'generated-agent', 'CodeBolt agent');
  }

  const namedMatch = text.match(/\b(?:named|called|name)\s+["'`]?([A-Za-z0-9_. -]{2,80})["'`]?/i);
  if (namedMatch && artifacts.length === 1) {
    artifacts[0].name = slugifyName(namedMatch[1], artifacts[0].name);
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
  };
}

export {
  ARTIFACT_BLOCKS,
  getActionBlockPath,
  inferArtifactsFromText,
  normalizeArtifact,
};
