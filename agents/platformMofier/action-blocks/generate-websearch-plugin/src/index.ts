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

const CODEBOLT_TESTING_TOOL_KNOWLEDGE = [
  'Use tool_search with category "testing" or "autoTesting" to discover the currently registered test-management tools before creating or running tests.',
  'Use test_case_create or autotesting_create_case to record artifact-specific smoke and regression cases with explicit steps.',
  'Use test_suite_create or autotesting_create_suite to group the generated artifact test cases.',
  'Use test_run_create or autotesting_create_run to start a tracked test run for the suite.',
  'Use test_run_update_status, autotesting_update_run_status, autotesting_update_run_case, and autotesting_update_run_step to record pass/fail status after manual or automated checks.',
  'Use terminal tools for local build, typecheck, lint, and package script checks before marking a test run passed.',
  'Document a Run section with dependency install, npm run build, and the CodeBolt load or restart step needed before runtime testing.',
  'After generation, run the local build from the artifact directory and record exact smoke-test commands and expected results in README.md.',
  'Use debug_open_browser plus browser or crawler tools for UI artifacts that need visual or interaction checks.',
  'Use side_execution_list_action_blocks, side_execution_start_action_block, and side_execution_get_status to test ActionBlocks through the same side-execution path parent agents use.',
];

const CODEBOLT_ARTIFACT_TESTING = {
  agent: [
    'Agent run/test: install dependencies, run npm run build, verify codeboltagent.yaml points to dist/index.js, load or restart the agent in CodeBolt, send a representative chat request, and confirm codebolt.onMessage returns structured output.',
    'For generated agents that invoke tools or ActionBlocks, create test cases that cover direct answer, tool use, ActionBlock routing, error handling, and completion reporting.',
  ],
  plugin: [
    'Plugin run/test: install dependencies, run npm run build, verify package.json#codebolt.plugin metadata, load or restart the plugin in CodeBolt, and exercise lifecycle handlers or registered tools/providers.',
    'For plugin-backed tools, create test cases for valid inputs, invalid inputs, startup failure, and clean shutdown.',
  ],
  'llm-plugin': [
    'LLM provider plugin run/test: install dependencies, run npm run build, load or restart the plugin in CodeBolt, verify provider registration, run completion and streaming smoke cases with test credentials or mocked upstream responses, and record credential failure behavior.',
  ],
  'websearch-plugin': [
    'Web search plugin run/test: install dependencies, run npm run build, load or restart the plugin in CodeBolt, verify provider registration, run a query smoke test, validate result shape, and record login, no-result, and upstream failure behavior.',
  ],
  provider: [
    'Provider run/test: install dependencies, run npm run build, validate providers.yaml, load or restart the provider in CodeBolt, exercise startup, agent-start, filesystem, shell, environment, cleanup, and failure paths that the provider claims to support.',
  ],
  'dynamic-panel': [
    'Dynamic panel run/test: install dependencies, run npm run build, load or restart the plugin in CodeBolt, verify ui.path, open the panel with dynamicPanel/debug browser tooling, test iframe messaging, and capture basic visual/interaction checks.',
  ],
  'custom-ui': [
    'Custom UI run/test: install dependencies, run npm run build, load or restart the plugin in CodeBolt, verify ui.path, open the UI with debug_open_browser plus browser tools, and test the primary user workflow, asset loading, and error states.',
  ],
  'action-block': [
    'ActionBlock run/test: install dependencies, run npm run build, verify actionblock.yml points to dist/index.js, load or restart ActionBlock discovery in CodeBolt, list the block with side_execution_list_action_blocks, invoke it with side_execution_start_action_block, and poll with side_execution_get_status.',
    'Create test cases for required params, missing or invalid params, successful output shape, timeout behavior, and idempotent repeated execution.',
  ],
};

const PLUGIN_SDK_EXPOSED_MODULES = [
  'default plugin facade',
  'webSearchProvider',
  'pluginTools',
  'gateway',
  'executionGateway',
  'chat',
  'browser',
  'dynamicPanel',
  'environment',
  'kvStore',
  'project',
  'artifact',
  'notificationFunctions',
];

const PLUGIN_SDK_FEATURE_MODULES = {
  lifecycle: ['plugin.onStart', 'plugin.onStop', 'plugin.waitForReady', 'plugin.pluginId', 'plugin.pluginDir', 'plugin.manifest'],
  providerRegistration: ['webSearchProvider.register', 'webSearchProvider.unregister'],
  searchHandling: ['webSearchProvider.onSearchRequest', 'webSearchProvider.sendReply', 'webSearchProvider.sendError'],
  loginAndConfig: ['webSearchProvider.onLoginRequest', 'providerConfig.apiKey', 'providerConfig.apiUrl', 'configFields'],
  browserBackedSearch: ['plugin.browser.newPage', 'plugin.browser.goToPage', 'plugin.browser.getMarkdown', 'plugin.browser.close'],
  optionalUi: ['plugin.dynamicPanel.open', 'plugin.dynamicPanel.onMessage', 'plugin.dynamicPanel.send'],
  optionalTools: ['pluginTools.registerTool', 'pluginTools.registerTools'],
};

const PLUGIN_SDK_API_CATALOG = [
  {
    module: 'imports',
    purpose: 'Use the published plugin SDK entry point.',
    calls: ['import plugin, { webSearchProvider } from "@codebolt/plugin-sdk"', 'import type { WebSearchRequest, WebSearchProviderManifest } from "@codebolt/plugin-sdk"'],
  },
  {
    module: 'plugin lifecycle',
    purpose: 'Initialize provider registration and cleanup.',
    calls: ['plugin.onStart(async (context) => { ... })', 'plugin.onStop(async () => { ... })', 'await plugin.waitForReady()', 'plugin.pluginId', 'plugin.pluginDir'],
  },
  {
    module: 'webSearchProvider',
    purpose: 'Register a provider and handle search and login requests.',
    calls: ['webSearchProvider.register(manifest)', 'webSearchProvider.onSearchRequest(handler)', 'webSearchProvider.onLoginRequest(handler)', 'webSearchProvider.sendReply(requestId, response, success)', 'webSearchProvider.sendError(requestId, error)', 'webSearchProvider.unregister(providerId)'],
  },
  {
    module: 'provider manifest',
    purpose: 'Describe provider identity, credentials, capabilities, and participation in automatic provider selection.',
    calls: ['providerId', 'name', 'description', 'requiresKey', 'configFields', 'capabilities', 'participatesInAuto'],
  },
  {
    module: 'search result shape',
    purpose: 'Normalize upstream results into CodeBolt search output.',
    calls: ['results: [{ title, url, snippet, rank, provider }]', 'query', 'count', 'filters', 'providerConfig'],
  },
];

const PLUGIN_SDK_USAGE_RULES = [
  'Register search provider metadata before registering request handlers.',
  'Normalize results into title, url, snippet, rank, and provider fields where available.',
  'Use sendReply for final search responses and sendError for failures.',
  'Read credentials from providerConfig and document configFields in README.',
  'Do not import from local SDK source paths; depend on published @codebolt/plugin-sdk only.',
  'For generated TypeScript, define narrow request, response, and SDK-result interfaces instead of unchecked type escapes.',
];

const PLATFORM_CONTRACT = {
  artifactType: 'websearch-plugin',
  roleName: 'CodeBolt web search provider plugin generator mini-agent',
  createLocation: '.codebolt/plugins/<name>',
  loader: 'The plugin service starts the plugin from package.json#codebolt.plugin, then webSearchProvider.register adds it to web search routing.',
  runtimeUse: 'The server web search service routes web search and login requests to registered web search provider plugins.',
  sourceLanguage: 'TypeScript',
  buildTool: 'tsc or esbuild with package.json main set to dist/index.js',
  buildOutput: 'dist/index.js',
  npmDependencies: ['@codebolt/plugin-sdk:^1.0.0', 'typescript:^5.4.5'],
  requiredFiles: ['package.json', 'tsconfig.json', 'src/index.ts', 'dist/index.js', 'README.md'],
  requiresPluginMetadata: true,
  requiresUiPath: false,
  keyApis: ['webSearchProvider.register', 'webSearchProvider.onSearchRequest', 'package.json#codebolt.plugin'],
  pluginSdkExposedModules: PLUGIN_SDK_EXPOSED_MODULES,
  pluginSdkFeatureModules: PLUGIN_SDK_FEATURE_MODULES,
  pluginSdkApiCatalog: PLUGIN_SDK_API_CATALOG,
  pluginSdkUsageRules: PLUGIN_SDK_USAGE_RULES,
  verificationMarkers: ['webSearchProvider.register', 'onSearchRequest'],
  applicationUse: [
    'The plugin registers a named web search provider.',
    'The server web search service selects registered providers for search requests.',
    'Plugin CLI message handling routes webSearchProvider requests between server and plugin.',
    'Provider login and credential behavior should be documented in the generated README.',
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
    'codebolt.plugin: provider identity, display name, description, and web search capability/configuration metadata.',
  ],
  sourceShape: [
    'src/index.ts imports plugin default and webSearchProvider named export from @codebolt/plugin-sdk.',
    'src/index.ts calls webSearchProvider.register(...) with provider metadata before request handlers.',
    'src/index.ts implements webSearchProvider.onSearchRequest with normalized search results.',
  ],
  exampleSnippets: [
    'package.json example shape: main: dist/index.js, codebolt.plugin identifies the web search provider plugin and runtime entry.',
    'src/index.ts example shape: import plugin, { webSearchProvider } from "@codebolt/plugin-sdk"; await webSearchProvider.register({ providerId: "<name>", name: "<displayName>" });',
    'handler example shape: webSearchProvider.onSearchRequest(async (request) => webSearchProvider.sendReply(request.requestId, { results: [{ title, url, snippet }] }));',
  ],
  manifestExpectations: [
    'package.json main is dist/index.js and includes codebolt.plugin metadata for discovery.',
    'The plugin metadata identifies the web search provider and login/configuration needs.',
    'scripts.build compiles TypeScript from src/index.ts into dist/index.js.',
  ],
  runtimeFlow: [
    'Import plugin default and webSearchProvider named export from @codebolt/plugin-sdk using ESM imports.',
    'Register the search provider metadata before handling requests.',
    'Implement search request handling with query validation, result normalization, and provider errors.',
    'Document login, API key, rate limit, and result shape assumptions in README.',
  ],
  publishSafetyRules: [
    'Use TypeScript source and ESM imports in src/index.ts.',
    'Use published npm dependency versions only.',
    'Use @codebolt/plugin-sdk ^1.0.0 for plugin runtime APIs.',
    'Avoid untyped escape hatches in TypeScript source; define narrow interfaces and use guarded values.',
    'Use @codebolt/codeboltjs ^5.1.36 and @codebolt/agent ^6.1.10 when those packages are needed.',
    'Do not write absolute local paths, development repo paths, or user-home paths into generated files.',
    'Keep provider code self-contained and do not import PlatformMofier internals.',
  ],
  generationChecklist: [
    'Create a plugin package that registers exactly one named web search provider unless the user asks for more.',
    'Generate package metadata, TypeScript source, build config, runtime dist output, and README.',
    'Include search, login, credentials, and provider configuration behavior when requested.',
    'Normalize search results into title, url, snippet/content, and metadata fields where appropriate.',
  ],
  verificationChecklist: [
    'All required files exist.',
    'webSearchProvider.register and onSearchRequest appear in generated files.',
    'package.json has codebolt.plugin metadata, dist/index.js as main, and a build script.',
    'No local dependency specifiers or local filesystem references are present.',
    'dist/index.js has valid JavaScript syntax.',
  ],
  commonFailureModes: [
    'Generating a normal plugin without webSearchProvider.register.',
    'Returning raw upstream responses instead of normalized search results.',
    'Hard-coding credentials or local endpoints.',
    'Using CommonJS import/export syntax in src/index.ts.',
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

function formatTestingToolKnowledge(artifactType) {
  const artifactTesting = CODEBOLT_ARTIFACT_TESTING[artifactType] || [];
  return [...CODEBOLT_TESTING_TOOL_KNOWLEDGE, ...artifactTesting]
    .map((item) => `- ${item}`)
    .join('\n');
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

Testing tool knowledge the generated README must include:
${formatTestingToolKnowledge(spec.artifactType)}

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
1. Use the embedded web search plugin contract and inspect optional user-provided references.
2. Create the target directory and every required manifest, TypeScript source, build config, build output, and README file.
3. Use src/index.ts as the source file and dist/index.js as the runtime file.
4. Register the web search provider and implement the search request handler.
5. Explain in README.md where this artifact should live, how CodeBolt loads it, and how the server web search service uses it.
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

function verifyReadmeTestingKnowledge(targetDirectory, artifactType, errors) {
  const readmePath = path.join(targetDirectory, 'README.md');
  if (!fs.existsSync(readmePath)) {
    return;
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  if (!/testing|test plan|verification/i.test(readmeContent)) {
    errors.push('README.md must include a Testing section for the generated artifact.');
  }
  if (!/(run|running|usage|build|installation)/i.test(readmeContent) || !/npm\s+(install|ci)/i.test(readmeContent) || !/npm\s+run\s+build/i.test(readmeContent)) {
    errors.push('README.md must include Run or Usage instructions with dependency install and npm run build steps.');
  }
  if (!/(CodeBolt.{0,120}(load|reload|restart|start)|(?:load|reload|restart|start).{0,120}CodeBolt)/is.test(readmeContent)) {
    errors.push('README.md must explain how to load, reload, restart, or start the generated artifact in CodeBolt before runtime testing.');
  }
  if (!/(tool_search|test_case_create|autotesting_create_case|test_suite_create|autotesting_create_suite|test_run_create|autotesting_create_run)/.test(readmeContent)) {
    errors.push('README.md Testing section must name the CodeBolt testing tools to create cases, suites, and runs.');
  }
  if (artifactType === 'agent' && (!/codeboltagent\.yaml/.test(readmeContent) || !/(onMessage|chat request|representative chat|send.*message)/is.test(readmeContent))) {
    errors.push('README.md Testing section for agents must document codeboltagent.yaml, starting the agent in CodeBolt, and sending a representative chat request.');
  }
  if ((artifactType === 'plugin' || artifactType === 'llm-plugin' || artifactType === 'websearch-plugin') && (!/codebolt\.plugin|package\.json#codebolt\.plugin/.test(readmeContent) || !/(plugin|provider).{0,120}(load|reload|restart|start)/is.test(readmeContent))) {
    errors.push('README.md Testing section for plugins must document package.json#codebolt.plugin, loading or restarting the plugin, and exercising registered handlers.');
  }
  if (artifactType === 'provider' && (!/providers\.yaml/.test(readmeContent) || !/(onProviderStart|onProviderAgentStart|provider.{0,120}(load|reload|restart|start))/is.test(readmeContent))) {
    errors.push('README.md Testing section for providers must document providers.yaml, loading or restarting the provider, and exercising provider lifecycle handlers.');
  }
  if (artifactType === 'action-block' && !/(side_execution_start_action_block|side_execution_get_status|side_execution_list_action_blocks)/.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must document side_execution_list_action_blocks, side_execution_start_action_block, and side_execution_get_status.');
  }
  if ((artifactType === 'custom-ui' || artifactType === 'dynamic-panel') && !/(debug_open_browser|browser|crawler)/.test(readmeContent)) {
    errors.push('README.md Testing section for UI artifacts must document debug_open_browser plus browser or crawler checks.');
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

  verifyReadmeTestingKnowledge(targetDirectory, spec.artifactType, errors);

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
    const firstExecution = await runAgentLoopForSpec(spec, []);
    let finalExecution = firstExecution;
    let verification = verifyArtifact(spec);
    let repairPassCount = 0;

    while (!verification.passed && repairPassCount < agentLoop.maxRepairPasses) {
      repairPassCount += 1;
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
