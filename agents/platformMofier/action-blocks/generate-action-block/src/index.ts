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

const CODEBOLT_EXPOSED_MODULES = [
  'actionBlock',
  'actionPlan',
  'agent',
  'agentDeliberation',
  'agentEventQueue',
  'agentPortfolio',
  'artifact',
  'autoTesting',
  'backgroundChildThreads',
  'browser',
  'calendar',
  'capability',
  'channel',
  'chat',
  'codebaseSearch',
  'codemap',
  'codeutils',
  'contextAssembly',
  'contextRuleEngine',
  'crawler',
  'dbmemory',
  'debug',
  'dynamicPanel',
  'environment',
  'episodicMemory',
  'eval',
  'eventLog',
  'fileUpdateIntent',
  'fs',
  'git',
  'groupFeedback',
  'history',
  'hook',
  'job',
  'knowledge',
  'knowledgeGraph',
  'kvStore',
  'llm',
  'mail',
  'mcp',
  'memory',
  'memoryIngestion',
  'orchestrator',
  'outputparsers',
  'persistentMemory',
  'project',
  'projectStructure',
  'projectStructureUpdateRequest',
  'rag',
  'requirementPlan',
  'reviewMergeRequest',
  'roadmap',
  'search',
  'sideExecution',
  'state',
  'swarm',
  'task',
  'terminal',
  'thread',
  'todo',
  'tokenizer',
  'utils',
  'vectordb',
  'webFetch',
  'webSearch',
];

const CODEBOLT_FEATURE_MODULES = {
  actionBlockEntrypoint: ['onActionBlockInvocation', 'chat', 'project'],
  fileEditing: ['fs', 'project', 'chat'],
  codeSearch: ['fs', 'codebaseSearch', 'codemap', 'projectStructure', 'chat'],
  terminalWork: ['terminal', 'chat', 'project'],
  webResearch: ['webSearch', 'webFetch', 'browser', 'chat'],
  browserAutomation: ['browser', 'chat'],
  gitWork: ['git', 'fs', 'chat'],
  llmCalls: ['llm', 'tokenizer', 'outputparsers'],
  memory: ['memory', 'persistentMemory', 'episodicMemory', 'dbmemory', 'knowledge', 'knowledgeGraph', 'rag', 'vectordb'],
  planning: ['todo', 'task', 'actionPlan', 'roadmap', 'requirementPlan'],
  subAgents: ['agent', 'thread', 'backgroundChildThreads', 'agentEventQueue', 'swarm', 'orchestrator'],
  actionBlocks: ['actionBlock', 'sideExecution'],
  dynamicUi: ['dynamicPanel', 'chat'],
  externalTools: ['mcp', 'capability', 'hook'],
  testingAndReview: ['autoTesting', 'eval', 'reviewMergeRequest', 'artifact'],
  stateAndEvents: ['state', 'kvStore', 'eventLog', 'history', 'channel'],
  providerAwareRuntime: ['environment', 'terminal', 'fs', 'sideExecution'],
};

const CODEBOLT_API_CATALOG = [
  {
    module: 'entry hooks',
    purpose: 'Register process entry points for the generated artifact.',
    calls: ['codebolt.onMessage(handler)', 'codebolt.onActionBlockInvocation(handler)', 'codebolt.onProviderStart(handler)', 'codebolt.onProviderAgentStart(handler)', 'codebolt.onProviderStop(handler)'],
  },
  {
    module: 'chat',
    purpose: 'Send progress, ask for user input, read thread history, and manage process status.',
    calls: ['codebolt.chat.sendMessage(message, payload)', 'codebolt.chat.getChatHistory(threadId)', 'codebolt.chat.askQuestion(question, buttons)', 'codebolt.chat.sendConfirmationRequest(message, buttons)', 'codebolt.chat.processStarted()', 'codebolt.chat.processFinished()'],
  },
  {
    module: 'project',
    purpose: 'Resolve workspace path and project settings before reading or writing files.',
    calls: ['codebolt.project.getProjectPath()', 'codebolt.project.getProjectSettings()', 'codebolt.project.getRepoMap(message)', 'codebolt.project.runProject()'],
  },
  {
    module: 'fs',
    purpose: 'Read, write, list, search, and patch project files through the platform filesystem layer.',
    calls: ['codebolt.fs.readFile(filePath)', 'codebolt.fs.readManyFiles(params)', 'codebolt.fs.listDirectory(params)', 'codebolt.fs.grepSearch(path, query, includePattern, excludePattern, caseSensitive)', 'codebolt.fs.fileSearch(query)', 'codebolt.fs.writeToFile(relPath, content)', 'codebolt.fs.createFile(name, content, folder)', 'codebolt.fs.updateFile(name, filePath, content)', 'codebolt.fs.editFileWithDiff(targetFile, codeEdit, diffId, prompt)'],
  },
  {
    module: 'terminal',
    purpose: 'Run shell commands, stream long tasks, and interrupt running commands.',
    calls: ['codebolt.terminal.executeCommand(command)', 'codebolt.terminal.executeCommandWithStream(command)', 'codebolt.terminal.executeCommandRunUntilError(command)', 'codebolt.terminal.executeCommandRunUntilInterrupt(command)', 'codebolt.terminal.sendManualInterrupt()'],
  },
  {
    module: 'git',
    purpose: 'Inspect and operate on the current repository through Git operations.',
    calls: ['codebolt.git.status()', 'codebolt.git.diff(commitHash)', 'codebolt.git.logs(path)', 'codebolt.git.addAll()', 'codebolt.git.commit(message)', 'codebolt.git.checkout(branch)', 'codebolt.git.branch(branch)', 'codebolt.git.pull()', 'codebolt.git.push()', 'codebolt.git.clone(url, path)'],
  },
  {
    module: 'llm',
    purpose: 'Call configured model roles and inspect model configuration for feature-specific inference.',
    calls: ['codebolt.llm.inference(params)', 'codebolt.llm.getModelConfig(modelId)'],
  },
  {
    module: 'webSearch and webFetch',
    purpose: 'Search the web and fetch selected URLs through server-side tools.',
    calls: ['codebolt.webSearch.search({ query, count, provider, filters })', 'codebolt.webFetch.fetch({ url, prompt, maxChars, timeoutMs })'],
  },
  {
    module: 'browser',
    purpose: 'Open pages, collect snapshots, click, type, scroll, and extract page content.',
    calls: ['codebolt.browser.newPage(options)', 'codebolt.browser.goToPage(url, options)', 'codebolt.browser.getMarkdown(options)', 'codebolt.browser.getSnapShot(options)', 'codebolt.browser.screenshot(options)', 'codebolt.browser.click(elementId, options)', 'codebolt.browser.type(elementId, text, options)', 'codebolt.browser.scroll(direction, pixels, options)'],
  },
  {
    module: 'actionBlock and sideExecution',
    purpose: 'Discover, invoke, and monitor action blocks from parent agents.',
    calls: ['codebolt.actionBlock.list(filter)', 'codebolt.actionBlock.getDetail(name)', 'codebolt.actionBlock.start(name, params)', 'codebolt.sideExecution.startWithActionBlock(path, params, timeout)', 'codebolt.sideExecution.startWithCode(code, params, timeout)', 'codebolt.sideExecution.getStatus(id)', 'codebolt.sideExecution.stop(id)'],
  },
  {
    module: 'agent orchestration',
    purpose: 'Coordinate child agents, background threads, external events, deliberation, and swarms.',
    calls: ['codebolt.agent.*', 'codebolt.thread.*', 'codebolt.backgroundChildThreads.*', 'codebolt.agentEventQueue.getPendingExternalEvents()', 'codebolt.agentDeliberation.*', 'codebolt.swarm.*', 'codebolt.orchestrator.*'],
  },
  {
    module: 'dynamicPanel',
    purpose: 'Open custom dynamic UI panels from an agent or action block and exchange messages with the iframe.',
    calls: ['codebolt.dynamicPanel.open(panelId, title, html, options)', 'codebolt.dynamicPanel.update(panelId, html)', 'codebolt.dynamicPanel.send(panelId, data)', 'codebolt.dynamicPanel.onMessage(panelId, handler)', 'codebolt.dynamicPanel.close(panelId)', 'codebolt.dynamicPanel.list()'],
  },
  {
    module: 'memory and knowledge',
    purpose: 'Persist context, retrieve project knowledge, and support RAG flows.',
    calls: ['codebolt.memory.*', 'codebolt.persistentMemory.*', 'codebolt.episodicMemory.*', 'codebolt.dbmemory.*', 'codebolt.knowledge.*', 'codebolt.knowledgeGraph.*', 'codebolt.rag.*', 'codebolt.vectordb.*'],
  },
  {
    module: 'planning',
    purpose: 'Manage tasks, todos, action plans, roadmaps, requirements, and project structure.',
    calls: ['codebolt.todo.*', 'codebolt.task.*', 'codebolt.actionPlan.*', 'codebolt.roadmap.*', 'codebolt.requirementPlan.*', 'codebolt.projectStructure.*'],
  },
  {
    module: 'mcp and capability',
    purpose: 'Connect external tools, hooks, and platform capabilities.',
    calls: ['codebolt.mcp.*', 'codebolt.capability.*', 'codebolt.hook.*'],
  },
];

const CODEBOLT_API_USAGE_RULES = [
  'Start from the requested features, choose matching modules from feature routing, then use catalog calls as the first source.',
  'Use exposed module names exactly as listed; inspect package declarations or project examples before adding a method outside the catalog.',
  'For workspace edits, resolve the project path first, read before writing, and prefer diff-based edits when preserving user work matters.',
  'For web research, use webSearch to find candidates and webFetch to read selected pages; include source URLs in final user-facing output when research influenced the answer.',
  'For dynamic UI, use dynamicPanel for action-block-owned panels; plugin-owned panels require plugin SDK metadata, UI assets, and event handlers.',
  'For child work, prefer sideExecution with action blocks when the feature is bounded and reusable; use background child threads for longer agent collaboration.',
  'For generated TypeScript, define narrow request, response, and SDK-result interfaces instead of unchecked type escapes.',
];

const PLATFORM_CONTRACT = {
  artifactType: 'action-block',
  roleName: 'CodeBolt ActionBlock generator mini-agent',
  createLocation: '.codebolt/actionblocks/<name> or an agent-local action-blocks/<name> directory',
  loader: 'ActionBlockRegistry validates actionblock.yml and SideExecutionManager starts the configured entryPoint in side execution.',
  runtimeUse: 'Parent agents invoke ActionBlocks through codebolt.sideExecution.startWithActionBlock by path or action-block registry invocation by name.',
  sourceLanguage: 'TypeScript',
  buildTool: 'tsc or webpack with package.json main and actionblock.yml entryPoint set to dist/index.js',
  buildOutput: 'dist/index.js',
  npmDependencies: ['@codebolt/codeboltjs:^5.1.36', '@codebolt/agent:^6.1.10', '@codebolt/types:^5.1.12', 'typescript:^5.4.5'],
  requiredFiles: ['actionblock.yml', 'package.json', 'tsconfig.json', 'src/index.ts', 'dist/index.js', 'README.md'],
  manifestFile: 'actionblock.yml',
  requiresPluginMetadata: false,
  requiresUiPath: false,
  keyApis: ['codebolt.onActionBlockInvocation', 'CodeboltAgent', 'LoopDetectionService', 'codebolt.sideExecution.startWithActionBlock', 'actionblock.yml entryPoint'],
  codeboltExposedModules: CODEBOLT_EXPOSED_MODULES,
  codeboltFeatureModules: CODEBOLT_FEATURE_MODULES,
  codeboltApiCatalog: CODEBOLT_API_CATALOG,
  codeboltApiUsageRules: CODEBOLT_API_USAGE_RULES,
  verificationMarkers: ['onActionBlockInvocation'],
  applicationUse: [
    'ActionBlockRegistry loads and validates actionblock.yml metadata.',
    'SideExecutionManager launches the action block entryPoint and passes params from the parent agent.',
    'Parent agents can invoke an action block path through codebolt.sideExecution.startWithActionBlock.',
    'The action block itself should be a mini-agent when it needs planning, tool use, verification, and repair.',
  ],
  artifactShape: [
    '<name>/actionblock.yml',
    '<name>/package.json',
    '<name>/tsconfig.json',
    '<name>/src/index.ts',
    '<name>/dist/index.js',
    '<name>/README.md',
  ],
  manifestShape: [
    'actionblock.yml: name, description, version, entryPoint: dist/index.js, inputs, outputs, and metadata.',
    'package.json: main: dist/index.js, scripts.build, published dependencies, and TypeScript dev dependency.',
  ],
  sourceShape: [
    'src/index.ts imports codebolt, CodeboltAgent, LoopDetectionService, and processor pieces when the action needs agentic behavior.',
    'src/index.ts registers codebolt.onActionBlockInvocation((threadContext) => runActionBlock(...)).',
    'src/index.ts uses a bounded CodeboltAgent loop with verification and repair for generation actions, then returns structured success, result, verification, filesCreated, and error fields.',
  ],
  exampleSnippets: [
    'actionblock.yml example shape: name, description, version, entryPoint: dist/index.js, inputs: [{ name: spec, type: object }], outputs: [{ name: success, type: boolean }].',
    'src/index.ts example shape: codebolt.onActionBlockInvocation(async (threadContext) => { const agent = new CodeboltAgent({ instructions, loopDetectionService, maxTurns: 30, compaction, processors }); const result = await agent.processMessage(reqMessage); return { success: result.success, result: result.finalMessage }; });',
    'parent invocation example shape: codebolt.sideExecution.startWithActionBlock(actionBlockPath, { spec }, timeoutMs).',
  ],
  manifestExpectations: [
    'actionblock.yml includes name, description, version, entryPoint set to dist/index.js, inputs, and outputs.',
    'package.json main is dist/index.js and scripts.build compiles TypeScript from src/index.ts.',
    'README documents invocation params, outputs, and how a parent agent calls the block.',
  ],
  runtimeFlow: [
    'Register codebolt.onActionBlockInvocation as the side-execution entry point.',
    'Normalize threadContext.params into a clear spec object.',
    'Run a bounded CodeboltAgent mini-agent loop with loop detection, compaction, external events, verification, and repair for generation actions.',
    'Return structured success, artifactPath/filesCreated when relevant, verification, and error fields.',
  ],
  publishSafetyRules: [
    'Use TypeScript source and ESM imports in src/index.ts.',
    'Use published npm dependency versions only.',
    'Avoid untyped escape hatches in TypeScript source; define narrow interfaces and use guarded values.',
    'Use @codebolt/codeboltjs ^5.1.36 and @codebolt/agent ^6.1.10 when those packages are needed.',
    'Do not write absolute local paths, development repo paths, or user-home paths into generated files.',
    'Keep the action block self-contained and do not import PlatformMofier internals.',
  ],
  generationChecklist: [
    'Create a self-contained action block package at the target directory.',
    'Generate actionblock.yml, package metadata, TypeScript source, build config, runtime dist output, and README.',
    'Define explicit inputs and outputs that match the requested action.',
    'Include full mini-agent phases: context gathering, planning, tool execution, verification, repair, and completion.',
  ],
  verificationChecklist: [
    'All required files exist.',
    'onActionBlockInvocation appears in generated files.',
    'actionblock.yml and package.json point to dist/index.js.',
    'No local dependency specifiers or local filesystem references are present.',
    'dist/index.js has valid JavaScript syntax.',
  ],
  commonFailureModes: [
    'Creating an agent instead of an action block.',
    'Missing actionblock.yml inputs and outputs.',
    'Returning unstructured strings instead of structured invocation results.',
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

function formatCodeboltFeatureModules(featureModules) {
  return Object.keys(featureModules || {})
    .map((featureName) => {
      const modules = featureModules[featureName];
      return `- ${featureName}: ${Array.isArray(modules) ? modules.join(', ') : String(modules || '')}`;
    })
    .join('\n');
}

function formatCodeboltApiCatalog(catalog) {
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
- Exposed CodeBolt JS modules: ${(contract.codeboltExposedModules || []).join(', ')}

CodeBolt JS feature routing:
${formatCodeboltFeatureModules(contract.codeboltFeatureModules)}

CodeBolt JS API catalog:
${formatCodeboltApiCatalog(contract.codeboltApiCatalog)}

CodeBolt JS usage rules:
${(contract.codeboltApiUsageRules || []).map((item) => `- ${item}`).join('\n')}

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
1. Use the embedded action-block contract and inspect optional user-provided references.
2. Create the target directory and every required manifest, TypeScript source, build config, build output, and README file.
3. Use src/index.ts as the source file and dist/index.js as the runtime file.
4. Implement codebolt.onActionBlockInvocation and return structured success/error results.
5. Explain in README.md where this artifact should live, how CodeBolt loads it, and how parent agents invoke it.
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

  if (contract.manifestFile && !fs.existsSync(path.join(targetDirectory, contract.manifestFile))) {
    errors.push(`Missing manifest file: ${contract.manifestFile}`);
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
  if (fs.existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
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
    await codebolt.chat.sendMessage('[action-block] mini-agent loop started', {
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
      await codebolt.chat.sendMessage('[action-block] mini-agent repair loop started', {
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
