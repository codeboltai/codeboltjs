import fs from "fs";
import path from "path";
import codebolt from "@codebolt/codeboltjs";
import { CodeboltAgent, LoopDetectionService } from "@codebolt/agent/unified";
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
} from "@codebolt/agent/processor-pieces";

const eventQueue = codebolt.agentEventQueue;

const FORBIDDEN_LOCAL_REFERENCE_MARKERS = [
  `${path.sep}Users${path.sep}`,
  ['Documents', 'codeboltai'].join(path.sep),
  ['codeboltjs', 'agents'].join('/'),
  ['codeboltjs', 'plugins'].join('/'),
  ['codeboltjs', 'providers'].join('/'),
  ['packages', 'server', 'src'].join('/'),
];

const PLUGIN_SDK_EXPOSED_MODULES = [
  'default plugin facade',
  'PluginClient',
  'gateway',
  'executionGateway',
  'pluginTools',
  'llmProvider',
  'webSearchProvider',
  'narrative',
  'notificationFunctions',
  'fs',
  'git',
  'terminal',
  'chat',
  'browser',
  'llm',
  'knowledge',
  'vectordb',
  'kvStore',
  'task',
  'thread',
  'todo',
  'job',
  'dynamicPanel',
  'environment',
  'mcp',
  'hook',
  'eventLog',
  'calendar',
  'mail',
  'codemap',
  'codebaseSearch',
  'debug',
  'cbstate',
  'memory',
  'project',
  'projectStructure',
  'artifact',
  'chatApi',
  'tasksApi',
  'threadsApi',
  'projectsApi',
  'systemApi',
  'gitApi',
  'jobsApi',
  'knowledgeApi',
  'environmentsApi',
  'fileApi',
  'fileReadApi',
  'calendarApi',
  'mailApi',
  'kvStoreApi',
  'vectordbApi',
  'todosApi',
  'hooksApi',
  'artifactsApi',
];

const PLUGIN_SDK_FEATURE_MODULES = {
  normalPlugin: ['plugin.onStart', 'plugin.onStop', 'plugin.waitForReady', 'plugin.pluginId', 'plugin.pluginDir', 'plugin.manifest'],
  llmProviderPlugin: ['llmProvider.register', 'llmProvider.onCompletionRequest', 'llmProvider.onStreamRequest', 'llmProvider.onLoginRequest', 'llmProvider.sendChunk', 'llmProvider.sendReply', 'llmProvider.sendError'],
  webSearchProviderPlugin: ['webSearchProvider.register', 'webSearchProvider.onSearchRequest', 'webSearchProvider.onLoginRequest', 'webSearchProvider.sendReply', 'webSearchProvider.sendError'],
  customUiPlugin: ['package.json#codebolt.plugin.ui.path', 'ui/default/index.html', 'plugin.onStart'],
  dynamicPanelPlugin: ['plugin.dynamicPanel.open', 'plugin.dynamicPanel.update', 'plugin.dynamicPanel.send', 'plugin.dynamicPanel.onMessage', 'plugin.dynamicPanel.router', 'plugin.dynamicPanel.close'],
  providerBackedTools: ['pluginTools.registerTool', 'pluginTools.registerTools', 'pluginTools.unregisterTool', 'pluginTools.getRegisteredToolNames'],
  gatewayRouting: ['gateway', 'executionGateway'],
  workspaceUtilities: ['plugin.fs', 'plugin.project', 'plugin.codebaseSearch', 'plugin.codemap', 'plugin.git'],
  runtimeUtilities: ['plugin.terminal', 'plugin.environment', 'plugin.mcp', 'plugin.hook', 'plugin.eventLog'],
  appApis: ['plugin.chatApi', 'plugin.tasksApi', 'plugin.threadsApi', 'plugin.projectsApi', 'plugin.fileApi', 'plugin.fileReadApi'],
  notifications: ['plugin.notify', 'notificationFunctions'],
};

const PLUGIN_SDK_API_CATALOG = [
  {
    module: 'imports',
    purpose: 'Use the published plugin SDK entry point and avoid local SDK paths.',
    calls: ['import plugin from "@codebolt/plugin-sdk"', 'import plugin, { llmProvider } from "@codebolt/plugin-sdk"', 'import plugin, { webSearchProvider } from "@codebolt/plugin-sdk"', 'import plugin, { pluginTools } from "@codebolt/plugin-sdk"', 'import type { PluginContext } from "@codebolt/plugin-sdk"'],
  },
  {
    module: 'plugin lifecycle',
    purpose: 'Register plugin startup, cleanup, readiness, and identity behavior.',
    calls: ['plugin.onStart(async (context) => { ... })', 'plugin.onStop(async () => { ... })', 'await plugin.waitForReady()', 'plugin.ready', 'plugin.pluginId', 'plugin.pluginDir', 'plugin.manifest'],
  },
  {
    module: 'plugin metadata',
    purpose: 'Make the package discoverable by the plugin service.',
    calls: ['package.json main: dist/index.js', 'package.json scripts.build', 'package.json codebolt.plugin id/name/displayName/description/version', 'package.json codebolt.plugin.ui.path for UI plugins'],
  },
  {
    module: 'llmProvider',
    purpose: 'Register a custom LLM provider and handle completion, streaming, and login requests.',
    calls: ['llmProvider.register(manifest)', 'llmProvider.onCompletionRequest(handler)', 'llmProvider.onStreamRequest(handler)', 'llmProvider.onLoginRequest(handler)', 'llmProvider.sendChunk(requestId, chunk)', 'llmProvider.sendReply(requestId, response, success)', 'llmProvider.sendError(requestId, error)', 'llmProvider.unregister(providerId)'],
  },
  {
    module: 'webSearchProvider',
    purpose: 'Register a custom web search provider and normalize search/login responses.',
    calls: ['webSearchProvider.register(manifest)', 'webSearchProvider.onSearchRequest(handler)', 'webSearchProvider.onLoginRequest(handler)', 'webSearchProvider.sendReply(requestId, response, success)', 'webSearchProvider.sendError(requestId, error)', 'webSearchProvider.unregister(providerId)'],
  },
  {
    module: 'dynamicPanel',
    purpose: 'Open panel UI, exchange messages, and expose fetch-style panel routes.',
    calls: ['plugin.dynamicPanel.open(panelId, title, html, options)', 'plugin.dynamicPanel.update(panelId, html)', 'plugin.dynamicPanel.send(panelId, payload)', 'plugin.dynamicPanel.onMessage(panelId, handler)', 'plugin.dynamicPanel.offMessage(panelId)', 'plugin.dynamicPanel.router(panelId).get(path, handler)', 'plugin.dynamicPanel.router(panelId).post(path, handler)', 'plugin.dynamicPanel.close(panelId)'],
  },
  {
    module: 'pluginTools',
    purpose: 'Expose plugin-backed tools to agents.',
    calls: ['pluginTools.registerTool(definition)', 'pluginTools.registerTools(definitions)', 'pluginTools.unregisterTool(name)', 'pluginTools.getRegisteredToolNames()'],
  },
  {
    module: 'gateway and executionGateway',
    purpose: 'Route plugin-specific requests and provider execution messages.',
    calls: ['gateway routes for plugin messages', 'executionGateway.claim()', 'executionGateway.onRequest(handler)', 'executionGateway.sendReply(requestId, result, success)', 'executionGateway.onNotification(handler)'],
  },
  {
    module: 'default facade modules',
    purpose: 'Use platform services from inside plugins through the default plugin facade.',
    calls: ['plugin.fs.*', 'plugin.project.*', 'plugin.terminal.*', 'plugin.chat.*', 'plugin.browser.*', 'plugin.llm.*', 'plugin.git.*', 'plugin.mcp.*', 'plugin.artifact.*'],
  },
  {
    module: 'HTTP API facades',
    purpose: 'Use client-style REST APIs when the plugin needs server resources through API classes.',
    calls: ['plugin.chatApi', 'plugin.tasksApi', 'plugin.threadsApi', 'plugin.projectsApi', 'plugin.fileApi', 'plugin.fileReadApi', 'plugin.artifactsApi'],
  },
  {
    module: 'notifications',
    purpose: 'Send typed notifications back through platform channels.',
    calls: ['plugin.notify', 'notificationFunctions'],
  },
];

const PLUGIN_SDK_USAGE_RULES = [
  'Use default import for lifecycle and facade modules; use named exports for provider modules and helper modules.',
  'Each plugin package must include package.json#codebolt.plugin metadata and dist/index.js as main.',
  'UI plugins must set codebolt.plugin.ui.path and include a static UI tree with relative asset paths.',
  'Provider plugins must register provider metadata before registering request handlers.',
  'Handlers should normalize requests, return structured success/error data, and call SDK reply/error helpers when the protocol expects out-of-band replies.',
  'Do not import from local SDK source paths; depend on published @codebolt/plugin-sdk only.',
  'For generated TypeScript, define narrow request, response, and SDK-result interfaces instead of unchecked type escapes.',
];

const PLATFORM_CONTRACT = {
  artifactType: 'plugin',
  roleName: 'CodeBolt normal plugin generator mini-agent',
  createLocation: '.codebolt/plugins/<name>',
  loader: 'The plugin service discovers package.json#codebolt.plugin metadata and starts the plugin entry point.',
  runtimeUse: 'Plugins connect through @codebolt/plugin-sdk, run plugin.onStart/plugin.onStop lifecycle handlers, and can register commands or providers.',
  sourceLanguage: 'TypeScript',
  buildTool: 'tsc or esbuild with package.json main set to dist/index.js',
  buildOutput: 'dist/index.js',
  npmDependencies: ['@codebolt/plugin-sdk:^1.0.0', 'typescript:^5.4.5'],
  requiredFiles: ['package.json', 'tsconfig.json', 'src/index.ts', 'dist/index.js', 'README.md'],
  requiresPluginMetadata: true,
  requiresUiPath: false,
  keyApis: ['plugin.onStart', 'plugin.onStop', 'package.json#codebolt.plugin'],
  pluginSdkExposedModules: PLUGIN_SDK_EXPOSED_MODULES,
  pluginSdkFeatureModules: PLUGIN_SDK_FEATURE_MODULES,
  pluginSdkApiCatalog: PLUGIN_SDK_API_CATALOG,
  pluginSdkUsageRules: PLUGIN_SDK_USAGE_RULES,
  verificationMarkers: ['plugin.onStart'],
  applicationUse: [
    'Plugin discovery reads package.json metadata under codebolt.plugin.',
    'The server starts the plugin process and routes plugin lifecycle messages.',
    'The plugin SDK exposes lifecycle handlers and provider registrations.',
    'Normal plugins should stay small and declare exactly what triggers or capabilities they expose.',
  ],
  artifactShape: [
    '<name>/package.json',
    '<name>/tsconfig.json',
    '<name>/src/index.ts',
    '<name>/dist/index.js',
    '<name>/README.md',
  ],
  manifestShape: [
    'package.json: main: dist/index.js, scripts.build, dependencies, codebolt.plugin metadata.',
    'codebolt.plugin: id/name, displayName, description, version, entry point, and declared capabilities when requested.',
  ],
  sourceShape: [
    'src/index.ts imports plugin APIs from @codebolt/plugin-sdk.',
    'src/index.ts registers plugin.onStart and plugin.onStop, then feature-specific handlers if requested.',
    'dist/index.js is generated runtime JavaScript that can be launched by the plugin service.',
  ],
  exampleSnippets: [
    'package.json example shape: main: dist/index.js, codebolt.plugin contains name/id, displayName, description, version, and entry information.',
    'src/index.ts example shape: import plugin from "@codebolt/plugin-sdk"; plugin.onStart(async () => ({ success: true })); plugin.onStop(async () => { /* cleanup */ });',
    'README example shape: install, build, where to place the plugin, lifecycle handlers, and configuration.',
  ],
  manifestExpectations: [
    'package.json main is dist/index.js and includes a codebolt.plugin metadata object.',
    'codebolt.plugin declares the plugin identity, display name, description, and runtime entry information needed by discovery.',
    'scripts.build compiles TypeScript from src/index.ts into dist/index.js.',
  ],
  runtimeFlow: [
    'Import plugin APIs from @codebolt/plugin-sdk using ESM imports.',
    'Register plugin.onStart and plugin.onStop handlers.',
    'Add only the command, provider, or event handlers requested by the feature spec.',
    'Keep lifecycle handlers idempotent and return structured status where handlers expect responses.',
  ],
  publishSafetyRules: [
    'Use TypeScript source and ESM imports in src/index.ts.',
    'Use published npm dependency versions only.',
    'Use @codebolt/plugin-sdk ^1.0.0 for plugin runtime APIs.',
    'Avoid untyped escape hatches in TypeScript source; define narrow interfaces and use guarded values.',
    'Use @codebolt/codeboltjs ^5.1.36 and @codebolt/agent ^6.1.10 when those packages are needed.',
    'Do not write absolute local paths, development repo paths, or user-home paths into generated files.',
    'Keep the plugin self-contained and do not import PlatformMofier internals.',
  ],
  generationChecklist: [
    'Create a self-contained plugin package at the target directory.',
    'Generate package metadata, TypeScript source, build config, runtime dist output, and README.',
    'Document plugin discovery, lifecycle, configuration, and declared capabilities.',
    'Keep the plugin minimal unless the requested features require extra handlers.',
  ],
  verificationChecklist: [
    'All required files exist.',
    'plugin.onStart appears in generated source or runtime.',
    'package.json has codebolt.plugin metadata, dist/index.js as main, and a build script.',
    'No local dependency specifiers or local filesystem references are present.',
    'dist/index.js has valid JavaScript syntax.',
  ],
  commonFailureModes: [
    'Missing package.json#codebolt.plugin metadata.',
    'Creating JavaScript-only source instead of TypeScript.',
    'Using CommonJS import/export syntax in src/index.ts.',
    'Adding provider-specific logic to a normal plugin unless requested.',
  ],
  forbiddenContentMarkers: FORBIDDEN_LOCAL_REFERENCE_MARKERS,
  referencePaths: [],
};

function titleCase(value) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

function normalizeSpec(inputSpec) {
  const spec = inputSpec && typeof inputSpec === 'object' ? inputSpec : {};
  const artifactType = PLATFORM_CONTRACT.artifactType;
  const name = slugifyName(spec.name || spec.displayName, `generated-${artifactType}`);
  const targetDirectory = spec.targetDirectory
    ? path.resolve(String(spec.targetDirectory))
    : path.resolve(process.cwd(), name);

  return {
    artifactType,
    name,
    displayName: spec.displayName ? String(spec.displayName) : titleCase(name),
    description: spec.description ? String(spec.description) : `Generated CodeBolt ${artifactType}`,
    features: Array.isArray(spec.features) ? spec.features : [],
    targetDirectory,
    projectPath: spec.projectPath ? String(spec.projectPath) : process.cwd(),
    originalRequest: spec.originalRequest ? String(spec.originalRequest) : '',
    callerConstraints: Array.isArray(spec.constraints) ? spec.constraints.map(String) : [],
    generationContext: spec.generationContext && typeof spec.generationContext === 'object' ? spec.generationContext : {},
    agentLoopReference: spec.agentLoopReference
      ? String(spec.agentLoopReference)
      : 'Embedded PlatformMofier mini-agent loop using @codebolt/agent/unified',
    referencePaths: Array.from(new Set([
      ...PLATFORM_CONTRACT.referencePaths,
      ...(Array.isArray(spec.referencePaths) ? spec.referencePaths : []),
    ])),
    platformAwareness: PLATFORM_CONTRACT,
  };
}

function formatPluginSdkFeatureModules(featureModules) {
  return Object.keys(featureModules || {})
    .map((featureName) => {
      const modules = featureModules[featureName];
      return `- ${featureName}: ${Array.isArray(modules) ? modules.join(', ') : String(modules || '')}`;
    })
    .join('\n');
}

function formatPluginSdkApiCatalog(catalog) {
  return (catalog || [])
    .map((entry) => [
      `- ${entry.module}: ${entry.purpose}`,
      `  Calls: ${(entry.calls || []).join('; ')}`,
    ].join('\n'))
    .join('\n');
}

function buildMiniAgentSystemPrompt(spec) {
  const contract = spec.platformAwareness;
  return `
You are the ${contract.roleName}.

You are an ActionBlock that must behave as a full mini-agent with its own reasoning, tool use, verification, and repair loop.
Create the requested ${spec.artifactType} by using tools, inspecting references, writing files, checking your work, and repairing failures.

Follow the agentic loop from:
${spec.agentLoopReference}

Feature contract:
- Artifact type: ${spec.artifactType}
- Name: ${spec.name}
- Display name: ${spec.displayName}
- Target directory: ${spec.targetDirectory}
- Canonical create location: ${contract.createLocation}
- Loader: ${contract.loader}
- Runtime use: ${contract.runtimeUse}
- Source language: ${contract.sourceLanguage}
- Build tool: ${contract.buildTool}
- Runtime build output: ${contract.buildOutput}
- NPM dependencies: ${(contract.npmDependencies || []).join(', ')}
- Required files: ${contract.requiredFiles.join(', ')}
- Key APIs: ${contract.keyApis.join(', ')}
- Exposed plugin SDK modules: ${(contract.pluginSdkExposedModules || []).join(', ')}

Plugin SDK feature routing:
${formatPluginSdkFeatureModules(contract.pluginSdkFeatureModules)}

Plugin SDK API catalog:
${formatPluginSdkApiCatalog(contract.pluginSdkApiCatalog)}

Plugin SDK usage rules:
${(contract.pluginSdkUsageRules || []).map((item) => `- ${item}`).join('\n')}

Expected artifact shape:
${(contract.artifactShape || []).map((item) => `- ${item}`).join('\n')}

Manifest and source shape:
${(contract.manifestShape || []).map((item) => `- ${item}`).join('\n')}
${(contract.sourceShape || []).map((item) => `- ${item}`).join('\n')}

Manifest expectations:
${(contract.manifestExpectations || []).map((item) => `- ${item}`).join('\n')}

Minimal examples to mirror:
${(contract.exampleSnippets || []).map((item) => `- ${item}`).join('\n')}

Robust generation context:
${(contract.runtimeFlow || []).map((item) => `- ${item}`).join('\n')}
${(contract.publishSafetyRules || []).map((item) => `- ${item}`).join('\n')}
${(spec.callerConstraints || []).map((item) => `- ${item}`).join('\n')}

Generation checklist:
${(contract.generationChecklist || []).map((item) => `- ${item}`).join('\n')}

Verification checklist:
${(contract.verificationChecklist || []).map((item) => `- ${item}`).join('\n')}

Known failure modes to avoid:
${(contract.commonFailureModes || []).map((item) => `- ${item}`).join('\n')}

Where the application uses this feature:
${contract.applicationUse.map((item) => `- ${item}`).join('\n')}

Optional user-provided reference paths:
${spec.referencePaths.length ? spec.referencePaths.map((referencePath) => `- ${referencePath}`).join('\n') : '- None. Use the embedded platform contract and npm package APIs.'}

Required workflow:
1. Use the embedded plugin contract and inspect optional user-provided references.
2. Create the target directory and every required manifest, TypeScript source, build config, build output, and README file.
3. Use src/index.ts as the source file and dist/index.js as the runtime file.
4. Use package.json#codebolt.plugin metadata and the SDK APIs listed in this contract.
5. Explain in README.md where this artifact should live, how CodeBolt loads it, and which application services use it.
6. Verify files exist and syntax is valid.
7. Call attempt_completion with JSON containing success, artifactPath, filesCreated, and notes.

If verification errors are provided, repair exactly those issues and verify again.
`.trim();
}

function buildMiniAgentUserMessage(spec, repairErrors) {
  const repairSection = repairErrors && repairErrors.length
    ? `\n\nVerification failed. Repair these issues:\n${repairErrors.map((error) => `- ${error}`).join('\n')}`
    : '';

  return `
Create the ${spec.artifactType} artifact now.

Original user request:
${spec.originalRequest || spec.description}

Requested features:
${spec.features.length ? spec.features.map((feature) => `- ${feature}`).join('\n') : '- Standard buildable scaffold'}

Caller generation context:
${Object.keys(spec.generationContext || {}).length ? JSON.stringify(spec.generationContext, null, 2) : '{}'}

Target directory:
${spec.targetDirectory}
${repairSection}
`.trim();
}

function collectFiles(targetDirectory) {
  const files = [];
  if (!fs.existsSync(targetDirectory)) {
    return files;
  }
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  };
  walk(targetDirectory);
  return files;
}

function readAllFiles(targetDirectory) {
  return collectFiles(targetDirectory)
    .map((filePath) => {
      try {
        return fs.readFileSync(filePath, 'utf8');
      } catch (_error) {
        return '';
      }
    })
    .join('\n');
}

function checkJsSyntax(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing runtime JavaScript entry: ${filePath}`);
    return;
  }
  try {
    new Function(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`Invalid runtime JavaScript syntax in ${filePath}: ${error.message}`);
  }
}

function verifyArtifact(spec) {
  const errors = [];
  const warnings = [];
  const targetDirectory = spec.targetDirectory;
  const contract = spec.platformAwareness;

  if (!fs.existsSync(targetDirectory)) {
    return { passed: false, errors: [`Target directory does not exist: ${targetDirectory}`], warnings };
  }

  for (const relativeFile of contract.requiredFiles) {
    if (!fs.existsSync(path.join(targetDirectory, relativeFile))) {
      errors.push(`Missing required file: ${relativeFile}`);
    }
  }

  const allContent = readAllFiles(targetDirectory);
  const typedFiles = collectFiles(targetDirectory).filter((filePath) => /\.(ts|tsx|d\.ts)$/.test(filePath));
  const broadTypePattern = new RegExp('\\b' + 'a' + 'ny' + '\\b');
  const castToBroadTypePattern = new RegExp('\\bas\\s+' + 'a' + 'ny' + '\\b');
  const castToUncheckedPattern = new RegExp('\\bas\\s+unknown\\b');
  for (const filePath of typedFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (castToBroadTypePattern.test(fileContent)) {
      errors.push('TypeScript source must not cast to an unchecked broad type.');
    }
    if (castToUncheckedPattern.test(fileContent)) {
      errors.push('TypeScript source must not cast through unchecked unknown; define a narrow interface or a checked conversion helper.');
    }
    if (broadTypePattern.test(fileContent)) {
      errors.push('TypeScript source must not use the unchecked broad type keyword.');
    }
  }
  for (const marker of contract.verificationMarkers) {
    if (!allContent.includes(marker)) {
      errors.push(`Missing required API marker: ${marker}`);
    }
  }

  for (const marker of contract.forbiddenContentMarkers || []) {
    if (allContent.includes(marker)) {
      errors.push(`Generated files must not contain local or development reference marker: ${marker}`);
    }
  }

  const sourcePath = path.join(targetDirectory, 'src/index.ts');
  if (fs.existsSync(sourcePath)) {
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    if (new RegExp('\\b' + 'require' + '\\s*\\(').test(sourceContent)) {
      errors.push('src/index.ts must use ESM import syntax, not CommonJS require calls.');
    }
    if (new RegExp(['module', 'exports'].join('\\.')).test(sourceContent)) {
      errors.push('src/index.ts must use ESM exports, not CommonJS export assignments.');
    }
  }

  const packagePath = path.join(targetDirectory, 'package.json');
  if (!fs.existsSync(packagePath)) {
    errors.push('Missing package.json');
  } else {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (contract.requiresPluginMetadata && (!packageJson.codebolt || !packageJson.codebolt.plugin)) {
        errors.push('Plugin package is missing codebolt.plugin metadata');
      }
      if (packageJson.main !== 'dist/index.js') {
        errors.push('package.json main must point to dist/index.js');
      } else {
        checkJsSyntax(path.join(targetDirectory, packageJson.main), errors);
      }

      if (!packageJson.scripts || !packageJson.scripts.build) {
        errors.push('package.json is missing a build script for TypeScript source');
      }

      const dependencySections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
      for (const section of dependencySections) {
        const dependencies = packageJson[section] || {};
        for (const [dependencyName, dependencyVersion] of Object.entries(dependencies)) {
          const normalizedVersion = String(dependencyVersion).trim();
          if (/^(file:|workspace:|link:)/.test(normalizedVersion)) {
            errors.push(section + '.' + dependencyName + ' must use a published npm version, not ' + dependencyVersion);
          }
          if (normalizedVersion === '*') {
            errors.push(section + '.' + dependencyName + ' must pin a published npm semver range instead of using a wildcard.');
          }
          if (dependencyName === '@codebolt/codeboltjs' && normalizedVersion !== '^5.1.36') {
            errors.push(section + '.' + dependencyName + ' must use ^5.1.36.');
          }
          if (dependencyName === '@codebolt/agent' && normalizedVersion !== '^6.1.10') {
            errors.push(section + '.' + dependencyName + ' must use ^6.1.10.');
          }
          if (dependencyName === '@codebolt/plugin-sdk' && normalizedVersion !== '^1.0.0') {
            errors.push(section + '.' + dependencyName + ' must use ^1.0.0.');
          }
        }
      }
    } catch (error) {
      errors.push(`Invalid package.json: ${error.message}`);
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}


function appendPromptMessage(prompt, role, content) {
  if (!prompt || !prompt.message || !Array.isArray(prompt.message.messages)) {
    return prompt;
  }

  prompt.message.messages.push({ role, content });
  return prompt;
}

function processExternalEvent(event, prompt) {
  if (!event) {
    return prompt;
  }

  const eventType = event.type || event.eventType;
  const eventData = event.data || event;

  if (eventType === 'agentQueueEvent') {
    const payload = eventData && eventData.payload ? eventData.payload : {};
    if (payload.type === 'steering' || eventData.eventType === 'steering') {
      const instruction = payload.instruction || payload.content || JSON.stringify(payload);
      return appendPromptMessage(
        prompt,
        'user',
        '<steering_message>\n<instruction>' + instruction + '</instruction>\n<context>The user sent a steering message while this feature-specific ActionBlock mini-agent was running. Adjust the current plan and continue.</context>\n</steering_message>',
      );
    }

    const content = payload.content || JSON.stringify(payload);
    return appendPromptMessage(
      prompt,
      'user',
      '<agent_event>\n<source>' + (eventData.sourceAgentId || 'system') + '</source>\n<content>' + content + '</content>\n</agent_event>',
    );
  }

  if (eventType === 'backgroundAgentCompletion' || eventType === 'backgroundGroupedAgentCompletion') {
    return appendPromptMessage(prompt, 'assistant', 'Background agent completed:\n' + JSON.stringify(eventData, null, 2));
  }

  return prompt;
}

const externalEventProcessor = {
  async modify(_originalRequest, createdMessage) {
    if (!eventQueue || !eventQueue.getPendingExternalEvents) {
      return createdMessage;
    }

    let nextPrompt = createdMessage;
    const pendingEvents = eventQueue.getPendingExternalEvents();
    for (const externalEvent of pendingEvents) {
      nextPrompt = processExternalEvent(externalEvent, nextPrompt);
    }

    return nextPrompt;
  },
};

const externalEventPostToolProcessor = {
  async modify({ nextPrompt }) {
    if (!eventQueue || !eventQueue.getPendingExternalEvents) {
      return { nextPrompt, shouldExit: false };
    }

    let updatedPrompt = nextPrompt;
    const pendingEvents = eventQueue.getPendingExternalEvents();
    for (const externalEvent of pendingEvents) {
      updatedPrompt = processExternalEvent(externalEvent, updatedPrompt);
    }

    return { nextPrompt: updatedPrompt, shouldExit: false };
  },
};

async function runAgentLoopForSpec(spec, repairErrors) {
  const systemPrompt = buildMiniAgentSystemPrompt(spec);
  const messageTimestamp = Date.now();
  const reqMessage = {
    userMessage: buildMiniAgentUserMessage(spec, repairErrors),
    messageId: `platform-mofier-${spec.artifactType}-${messageTimestamp}`,
    threadId: process.env.THREAD_ID || `platform-mofier-${spec.artifactType}-${messageTimestamp}`,
    mentionedAgents: [],
    mentionedFiles: [],
    mentionedFullPaths: spec.referencePaths,
  };

  const ideContextModifier = new IdeContextModifier({
    includeActiveFile: true,
    includeOpenFiles: true,
    includeCursorPosition: true,
    includeSelectedText: true,
  });

  const loopDetectionService = new LoopDetectionService({ debug: true });
  const agent = new CodeboltAgent({
    instructions: systemPrompt,
    enableLogging: true,
    loopDetectionService,
    maxTurns: 30,
    compaction: {
      enableLogging: true,
      autoCompactEnabled: true,
      contextCollapseEnabled: false,
    },
    processors: {
      messageModifiers: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        ideContextModifier,
        new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
        new ToolInjectionModifier({ includeToolDescriptions: true }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true }),
        externalEventProcessor,
      ],
      preInferenceProcessors: [],
      postInferenceProcessors: [],
      preToolCallProcessors: [],
      postToolCallProcessors: [externalEventPostToolProcessor],
    },
  });

  const executionResult = await agent.processMessage(reqMessage);
  if (!executionResult || executionResult.success === false) {
    throw new Error((executionResult && executionResult.error) || `Mini-agent failed while generating ${spec.artifactType}.`);
  }

  return executionResult;
}

async function runActionBlockMiniAgent(threadContext) {
  const params = threadContext && threadContext.params ? threadContext.params : {};
  const spec = normalizeSpec(params.spec || params);
  const agentLoop = {
    reference: spec.agentLoopReference,
    steps: ['understand-feature-contract', 'gather-context', 'plan-artifact', 'write-with-tools', 'run-checks', 'verify-contract', 'repair-if-needed', 'attempt-completion'],
    maxTurns: 30,
    maxRepairPasses: 2,
    loopDetection: true,
    compaction: { autoCompactEnabled: true, contextCollapseEnabled: false },
    externalEvents: true,
  };

  try {
    await codebolt.chat.sendMessage('[plugin] mini-agent loop started', {
      targetDirectory: spec.targetDirectory,
      platformAwareness: spec.platformAwareness,
      referencePaths: spec.referencePaths,
      agentLoop,
    });

    const firstExecution = await runAgentLoopForSpec(spec, []);
    let finalExecution = firstExecution;
    let verification = verifyArtifact(spec);
    let repairPassCount = 0;

    while (!verification.passed && repairPassCount < agentLoop.maxRepairPasses) {
      repairPassCount += 1;
      await codebolt.chat.sendMessage('[plugin] mini-agent repair loop started', {
        repairPass: repairPassCount,
        verification,
      });
      finalExecution = await runAgentLoopForSpec(spec, verification.errors);
      verification = verifyArtifact(spec);
    }

    const filesCreated = collectFiles(spec.targetDirectory);
    return {
      success: verification.passed,
      artifactPath: spec.targetDirectory,
      filesCreated,
      verification,
      agentLoop,
      finalMessage: finalExecution && finalExecution.finalMessage,
      error: verification.passed ? undefined : verification.errors.join('; '),
    };
  } catch (error) {
    return {
      success: false,
      artifactPath: spec.targetDirectory,
      filesCreated: collectFiles(spec.targetDirectory),
      verification: {
        passed: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
      },
      agentLoop,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

codebolt.onActionBlockInvocation((threadContext) => runActionBlockMiniAgent(threadContext));

export { runActionBlockMiniAgent };

export const __test = {
  normalizeSpec,
  buildMiniAgentSystemPrompt,
  buildMiniAgentUserMessage,
  verifyArtifact,
};
