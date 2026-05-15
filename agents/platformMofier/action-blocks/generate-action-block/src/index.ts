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

const ACTIONBLOCK_TEST_TOOL_EXAMPLES = [
  'Dedicated ActionBlock tools live in @codebolt/codeboltjs/src/tools/actionBlock.',
  'The available dedicated tools are exported as actionBlockTools: actionBlock_list, actionBlock_getDetail, and actionBlock_start.',
  'Tool schemas: actionBlock_list accepts optional filterType and explanation; actionBlock_getDetail requires actionBlockName; actionBlock_start requires actionBlockName and accepts params plus explanation.',
  'After npm run build succeeds, test the created ActionBlock with the dedicated tools before marking generation successful.',
  'Use actionBlock_list with optional filterType "filesystem", "runtime", or "builtin" to confirm the generated ActionBlock is discoverable.',
  'Use actionBlock_getDetail with { "actionBlockName": "<generated-action-block-name>" } to verify metadata, type, path, version, and entryPoint.',
  'Use actionBlock_start with { "actionBlockName": "<generated-action-block-name>", "params": { ...validInputs } } to execute the generated ActionBlock by registered name.',
  'Example registered-name test flow: actionBlock_list -> actionBlock_getDetail -> actionBlock_start.',
  'Example side-execution test flow: side_execution_list_action_blocks -> side_execution_start_action_block with the generated ActionBlock path and params -> side_execution_get_status using the returned sideExecutionId.',
  'README.md Testing section must include at least one concrete actionBlock_start example with valid params and one expected success response shape.',
  'README.md Testing section must include one invalid-input actionBlock_start example and the expected structured error behavior.',
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
    'ActionBlock dedicated tool tests must run after the build: use actionBlock_list, actionBlock_getDetail, and actionBlock_start from @codebolt/codeboltjs/src/tools/actionBlock to validate discovery, metadata, and execution by name.',
    'README actionBlock_start example shape: actionBlock_start({ "actionBlockName": "<name>", "params": { ...validInputs }, "explanation": "Run the generated ActionBlock smoke test" }).',
    'README actionBlock_getDetail example shape: actionBlock_getDetail({ "actionBlockName": "<name>", "explanation": "Verify generated ActionBlock metadata" }).',
    'Create test cases for required params, missing or invalid params, successful output shape, timeout behavior, and idempotent repeated execution.',
  ],
};

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
    purpose: 'Send progress, ask for user input, and read thread history.',
    calls: ['codebolt.chat.sendMessage(message, payload)', 'codebolt.chat.getChatHistory(threadId)', 'codebolt.chat.askQuestion(question, buttons)', 'codebolt.chat.sendConfirmationRequest(message, buttons)'],
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
    module: 'ActionBlock testing tools',
    purpose: 'Run post-build registered-name smoke tests through the CodeBolt declarative tools exported from @codebolt/codeboltjs/src/tools/actionBlock.',
    calls: ['actionBlock_list({ filterType?: "filesystem" | "runtime" | "builtin", explanation? })', 'actionBlock_getDetail({ actionBlockName, explanation? })', 'actionBlock_start({ actionBlockName, params?, explanation? })'],
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
  'For generated ActionBlocks, run npm run build first, then use actionBlock_list, actionBlock_getDetail, and actionBlock_start to test the built block through CodeBolt registration.',
];

const PLATFORM_CONTRACT = {
  artifactType: 'action-block',
  roleName: 'CodeBolt ActionBlock generator mini-agent',
  createLocation: '.codebolt/actionblocks/<name> or an agent-local action-blocks/<name> directory',
  loader: 'ActionBlockRegistry validates actionblock.yml and SideExecutionManager starts the configured entryPoint in side execution.',
  runtimeUse: 'Parent agents invoke ActionBlocks through codebolt.sideExecution.startWithActionBlock by path or action-block registry invocation by name.',
  sourceLanguage: 'TypeScript',
  buildTool: 'webpack build matching the working ActionBlock backup format: package.json build runs npx webpack, actionblock.yml entryPoint is dist/index.js, webpack outputs a CommonJS2 bundle to dist/index.js and copies actionblock.yml to dist/actionblock.yml',
  buildOutput: 'dist/index.js',
  npmDependencies: ['@codebolt/codeboltjs:latest or ^5.1.36', '@codebolt/agent:^6.1.10 when mini-agent planning is needed', '@codebolt/types:^5.1.12', 'typescript:^5.3.3 or newer', 'webpack:^5.103.0', 'webpack-cli:^5.1.4', 'ts-loader:^9.5.1', 'copy-webpack-plugin:^12.0.2', 'process:^0.11.10', 'buffer:^6.0.3', 'node-polyfill-webpack-plugin:^4.1.0'],
  requiredFiles: ['actionblock.yml', 'package.json', 'tsconfig.json', 'webpack.config.js', 'process-polyfill.js', 'src/index.ts', 'dist/index.js', 'dist/actionblock.yml', 'README.md'],
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
    '<name>/webpack.config.js',
    '<name>/process-polyfill.js',
    '<name>/src/index.ts',
    '<name>/dist/index.js',
    '<name>/dist/actionblock.yml',
    '<name>/README.md',
  ],
  manifestShape: [
    'actionblock.yml: name, description, version, entryPoint: dist/index.js, inputs, outputs, and metadata.',
    'package.json: backup-compatible shape with main: index.js, scripts.build: npx webpack, scripts.dev: npx tsx src/index.ts, scripts.clean: rm -rf dist, scripts.prebuild: pnpm run clean, files: ["dist/**/*"], published dependencies, and no "type": "module" field.',
    'tsconfig.json: backup-compatible compiler settings using target ES2020, module Node16, moduleResolution node16, rootDir ./src, outDir ./dist, declaration/declarationMap/sourceMap enabled, noImplicitAny and strict null/function/return/fallthrough checks enabled.',
  ],
  sourceShape: [
    'src/index.ts imports codebolt, CodeboltAgent, LoopDetectionService, and processor pieces when the action needs agentic behavior.',
    'src/index.ts registers codebolt.onActionBlockInvocation((threadContext) => runActionBlock(...)).',
    'src/index.ts uses a bounded CodeboltAgent loop with verification and repair for generation actions, then returns structured success, result, verification, filesCreated, and error fields.',
    'src/index.ts may use ESM TypeScript imports, but npm run build must emit a webpackBootstrap CommonJS2 dist/index.js bundle because SideExecutionManager starts dist/index.js through Electron utilityProcess.fork().',
  ],
  exampleSnippets: [
    'actionblock.yml example shape: name, description, version, entryPoint: dist/index.js, inputs: [{ name: spec, type: object }], outputs: [{ name: success, type: boolean }].',
    'src/index.ts example shape: codebolt.onActionBlockInvocation(async (threadContext) => { const agent = new CodeboltAgent({ instructions, loopDetectionService, maxTurns: 30, compaction, processors }); const result = await agent.processMessage(reqMessage); return { success: result.success, result: result.finalMessage }; });',
    'parent invocation example shape: codebolt.sideExecution.startWithActionBlock(actionBlockPath, { spec }, timeoutMs).',
    'ActionBlock registered tool test example shape: actionBlock_list({ filterType: "filesystem" }); actionBlock_getDetail({ actionBlockName: "<name>" }); actionBlock_start({ actionBlockName: "<name>", params: { ...validInputs } });',
    'ActionBlock side-execution test example shape: side_execution_start_action_block({ actionBlockPath: "<generated-path>", params: { ...validInputs }, timeout: 120000 }); then side_execution_get_status({ sideExecutionId }).',
  ],
  manifestExpectations: [
    'actionblock.yml includes name, description, version, entryPoint set to dist/index.js, inputs, and outputs.',
    'package.json follows the working backup format: main is index.js, no "type": "module", scripts.build is npx webpack, scripts.dev is npx tsx src/index.ts, scripts.clean removes dist, scripts.prebuild runs pnpm run clean, and files includes dist/**/*.',
    'tsconfig.json uses module Node16 and moduleResolution node16, while webpack.config.js emits the CommonJS2 runtime bundle and copies actionblock.yml to dist/actionblock.yml.',
    'README documents invocation params, outputs, how a parent agent calls the block, and concrete actionBlock_list/actionBlock_getDetail/actionBlock_start test examples.',
  ],
  runtimeFlow: [
    'Register codebolt.onActionBlockInvocation as the side-execution entry point.',
    'Normalize threadContext.params into a clear spec object.',
    'Run a bounded CodeboltAgent mini-agent loop with loop detection, compaction, external events, verification, and repair for generation actions.',
    'Return structured success, artifactPath/filesCreated when relevant, verification, and error fields.',
  ],
  publishSafetyRules: [
    'Use TypeScript source and ESM imports in src/index.ts, but emit a webpack-bundled CommonJS2 dist/index.js runtime.',
    'Do not set package.json "type" to "module" for generated ActionBlocks; Electron side execution launches dist/index.js through utilityProcess.fork().' ,
    'Generate webpack.config.js from the working backup pattern: target node, entry ./src/index.ts, output dist/index.js, libraryTarget commonjs2, CopyWebpackPlugin copies actionblock.yml, ProvidePlugin supplies process-polyfill.js and Buffer, and optional native websocket dependencies are ignored.',
    'Use published npm dependency versions only.',
    'Avoid untyped escape hatches in TypeScript source; define narrow interfaces and use guarded values.',
    'Use @codebolt/codeboltjs ^5.1.36 and @codebolt/agent ^6.1.10 when those packages are needed.',
    'Do not write absolute local paths, development repo paths, or user-home paths into generated files.',
    'Keep the action block self-contained and do not import PlatformMofier internals.',
  ],
  generationChecklist: [
    'Create a self-contained action block package at the target directory.',
    'Generate actionblock.yml, package metadata, TypeScript source, webpack.config.js, process-polyfill.js, runtime dist output, copied dist/actionblock.yml, and README.',
    'Define explicit inputs and outputs that match the requested action.',
    'Include full mini-agent phases: context gathering, planning, tool execution, verification, repair, and completion.',
  ],
  verificationChecklist: [
    'All required files exist.',
    'onActionBlockInvocation appears in generated files.',
    'actionblock.yml entryPoint points to dist/index.js and package.json follows the backup format with main index.js.',
    'After the build, the created block is tested with actionBlock_list, actionBlock_getDetail, and actionBlock_start from @codebolt/codeboltjs/src/tools/actionBlock.',
    'No local dependency specifiers or local filesystem references are present.',
    'dist/index.js has valid JavaScript syntax.',
    'dist/index.js is a webpackBootstrap CommonJS2 bundle and does not start with top-level ESM import syntax.',
    'package.json does not set "type": "module".',
    'tsconfig.json uses module Node16 and moduleResolution node16.' ,
    'webpack.config.js exists and outputs libraryTarget commonjs2 to dist/index.js.' ,
    'dist/actionblock.yml exists and matches the root actionblock.yml copy.',
  ],
  commonFailureModes: [
    'Creating an agent instead of an action block.',
    'Missing actionblock.yml inputs and outputs.',
    'Returning unstructured strings instead of structured invocation results.',
    'Using CommonJS import/export syntax in src/index.ts.',
    'Emitting ESM runtime output, skipping the webpack CommonJS2 bundle, or setting package.json "type": "module", which prevents side execution from connecting and causes 30s connection timeouts.',
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
  const actionBlockToolExamples = artifactType === 'action-block' ? ACTIONBLOCK_TEST_TOOL_EXAMPLES : [];
  return [...CODEBOLT_TESTING_TOOL_KNOWLEDGE, ...artifactTesting, ...actionBlockToolExamples]
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
1. Use the embedded action-block contract and inspect optional user-provided references.
2. Create the target directory and every required manifest, TypeScript source, build config, build output, and README file.
3. Use the working backup ActionBlock format: src/index.ts source, webpack.config.js + process-polyfill.js build support, root actionblock.yml copied to dist/actionblock.yml, and webpack-bundled CommonJS2 dist/index.js runtime. package.json must not set "type": "module".
4. Implement codebolt.onActionBlockInvocation and return structured success/error results.
5. Explain in README.md where this artifact should live, how CodeBolt loads it, and how parent agents invoke it.
6. Run the local build from the target directory with npm run build.
7. After the build succeeds, test the created ActionBlock with actionBlock_list, actionBlock_getDetail, and actionBlock_start from @codebolt/codeboltjs/src/tools/actionBlock. Use valid params and confirm the success response shape.
8. Also document or run the side-execution path with side_execution_list_action_blocks, side_execution_start_action_block, and side_execution_get_status.
9. Verify files exist, syntax is valid, and README.md records the post-build test commands, expected results, and invalid-input behavior.
10. Call attempt_completion with JSON containing success, artifactPath, filesCreated, verification, and notes.

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
  if (artifactType === 'action-block' && !/(actionBlock_list|actionBlock_getDetail|actionBlock_start)/.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must document actionBlock_list, actionBlock_getDetail, and actionBlock_start from @codebolt/codeboltjs/src/tools/actionBlock.');
  }
  if (artifactType === 'action-block' && !/(after|post[-\s]?build|once.{0,80}build|npm\s+run\s+build[\s\S]{0,1000}actionBlock_(?:list|getDetail|start)|actionBlock_(?:list|getDetail|start)[\s\S]{0,1000}npm\s+run\s+build)/i.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must make the dedicated actionBlock_list/actionBlock_getDetail/actionBlock_start tests a post-build step.');
  }
  if (artifactType === 'action-block' && !/@codebolt\/codeboltjs\/src\/tools\/actionBlock/.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must reference the dedicated tool source @codebolt/codeboltjs/src/tools/actionBlock.');
  }
  if (artifactType === 'action-block' && !/actionBlock_start[\s\S]{0,500}(params|validInputs|required|input)/.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must include a concrete actionBlock_start example with valid params.');
  }
  if (artifactType === 'action-block' && !/actionBlock_start[\s\S]{0,800}(success|result|llmContent|returnDisplay)/i.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must include the expected successful actionBlock_start response shape.');
  }
  if (artifactType === 'action-block' && !/(invalid|missing|required).{0,120}(params|input|error)|actionBlock_start[\s\S]{0,500}(invalid|missing|required)/i.test(readmeContent)) {
    errors.push('README.md Testing section for ActionBlocks must include an invalid-input actionBlock_start example and expected structured error behavior.');
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
      if (packageJson.main !== 'index.js') {
        errors.push('package.json main must be index.js to match the working backup ActionBlock package format.');
      }
      checkJsSyntax(path.join(targetDirectory, 'dist/index.js'), errors);

      if (!packageJson.scripts || packageJson.scripts.build !== 'npx webpack') {
        errors.push('package.json scripts.build must be "npx webpack" to produce the working backup webpack bundle format.');
      }
      if (!packageJson.scripts || packageJson.scripts.dev !== 'npx tsx src/index.ts') {
        errors.push('package.json scripts.dev must be "npx tsx src/index.ts".');
      }
      if (!packageJson.scripts || packageJson.scripts.clean !== 'rm -rf dist') {
        errors.push('package.json scripts.clean must be "rm -rf dist".');
      }
      if (!packageJson.scripts || packageJson.scripts.prebuild !== 'pnpm run clean') {
        errors.push('package.json scripts.prebuild must be "pnpm run clean".');
      }
      if (!Array.isArray(packageJson.files) || !packageJson.files.includes('dist/**/*')) {
        errors.push('package.json files must include "dist/**/*".');
      }

      if (packageJson.type === 'module') {
        errors.push('package.json must not set "type": "module" for ActionBlocks; side execution launches dist/index.js through Electron utilityProcess.fork().');
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
          if (dependencyName === '@codebolt/codeboltjs' && normalizedVersion !== '^5.1.36' && normalizedVersion !== 'latest') {
            errors.push(section + '.' + dependencyName + ' must use ^5.1.36 or latest.');
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

  const tsconfigPath = path.join(targetDirectory, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfigJson = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      const compilerOptions = tsconfigJson.compilerOptions || {};
      if (compilerOptions.module !== 'Node16') {
        errors.push('tsconfig.json compilerOptions.module must be Node16 for ActionBlock side-execution compatibility.');
      }
      if (compilerOptions.moduleResolution !== 'node16') {
        errors.push('tsconfig.json compilerOptions.moduleResolution must be node16 so @codebolt package exports resolve correctly.');
      }
    } catch (error) {
      errors.push("Invalid tsconfig.json: " + error.message);
    }
  }

  const webpackConfigPath = path.join(targetDirectory, 'webpack.config.js');
  if (fs.existsSync(webpackConfigPath)) {
    const webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
    if (!webpackConfig.includes("target: 'node'") && !webpackConfig.includes('target: "node"')) {
      errors.push('webpack.config.js must set target: node.');
    }
    if (!webpackConfig.includes("libraryTarget: 'commonjs2'") && !webpackConfig.includes('libraryTarget: "commonjs2"')) {
      errors.push('webpack.config.js must output libraryTarget: commonjs2.');
    }
    if (!webpackConfig.includes('CopyWebpackPlugin') || !webpackConfig.includes('actionblock.yml')) {
      errors.push('webpack.config.js must copy actionblock.yml into dist using CopyWebpackPlugin.');
    }
    if (!webpackConfig.includes('process-polyfill.js')) {
      errors.push('webpack.config.js must use process-polyfill.js in the working backup format.');
    }
  }

  const distActionblockPath = path.join(targetDirectory, 'dist/actionblock.yml');
  const rootActionblockPath = path.join(targetDirectory, 'actionblock.yml');
  if (fs.existsSync(distActionblockPath) && fs.existsSync(rootActionblockPath)) {
    if (fs.readFileSync(distActionblockPath, 'utf8') !== fs.readFileSync(rootActionblockPath, 'utf8')) {
      errors.push('dist/actionblock.yml must match the root actionblock.yml copied by webpack.');
    }
  }

  const distIndexPath = path.join(targetDirectory, 'dist/index.js');
  if (fs.existsSync(distIndexPath)) {
    const distContent = fs.readFileSync(distIndexPath, 'utf8');
    if (/^\s*import\s/m.test(distContent)) {
      errors.push('dist/index.js must be CommonJS-compatible and must not contain top-level ESM import syntax.');
    }
    if (!distContent.includes('webpackBootstrap')) {
      errors.push('dist/index.js must be a webpack bundle matching the working backup ActionBlock format.');
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
