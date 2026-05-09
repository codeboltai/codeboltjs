import fs from "fs";
import path from "path";
import codebolt from "@codebolt/codeboltjs";
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from "@codebolt/agent/unified";
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
} from "@codebolt/agent/processor-pieces";

const FORBIDDEN_LOCAL_REFERENCE_MARKERS = [
  `${path.sep}Users${path.sep}`,
  ['Documents', 'codeboltai'].join(path.sep),
  ['codeboltjs', 'agents'].join('/'),
  ['codeboltjs', 'plugins'].join('/'),
  ['codeboltjs', 'providers'].join('/'),
  ['packages', 'server', 'src'].join('/'),
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
  npmDependencies: ['@codebolt/plugin-sdk:*', 'typescript:^5.4.5'],
  requiredFiles: ['package.json', 'tsconfig.json', 'src/index.ts', 'dist/index.js', 'README.md'],
  requiresPluginMetadata: true,
  requiresUiPath: false,
  keyApis: ['plugin.onStart', 'plugin.onStop', 'package.json#codebolt.plugin'],
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
    'src/index.ts example shape: import { plugin } from "@codebolt/plugin-sdk"; plugin.onStart(async () => ({ success: true })); plugin.onStop(async () => ({ success: true }));',
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
    'Do not write absolute local paths, development repo paths, or user-home paths into generated files.',
    'Keep the plugin self-contained and do not import PlatformMofier internals.',
  ],
  generationChecklist: [
    'Create a self-contained plugin package at the target directory.',
    'Generate package metadata, TypeScript source, build config, runtime dist output, and README.',
    'Document plugin discovery, lifecycle, configuration, and any declared capabilities.',
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
          if (/^(file:|workspace:|link:)/.test(String(dependencyVersion))) {
            errors.push(section + '.' + dependencyName + ' must use a published npm version, not ' + dependencyVersion);
          }
        }
      }
    } catch (error) {
      errors.push(`Invalid package.json: ${error.message}`);
    }
  }

  return { passed: errors.length === 0, errors, warnings };
}

async function runAgentLoopForSpec(spec, repairErrors) {

  const systemPrompt = buildMiniAgentSystemPrompt(spec);
  const reqMessage = {
    userMessage: buildMiniAgentUserMessage(spec, repairErrors),
    messageId: `platform-mofier-plugin-${Date.now()}`,
    threadId: process.env.THREAD_ID || `platform-mofier-plugin-${Date.now()}`,
    mentionedAgents: [],
    mentionedFiles: [],
    mentionedFullPaths: spec.referencePaths,
  };

  const promptGenerator = new InitialPromptGenerator({
    processors: [
      new ChatHistoryMessageModifier({ enableChatHistory: true }),
      new EnvironmentContextModifier({ enableFullContext: true }),
      new DirectoryContextModifier(),
      new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
      new ToolInjectionModifier({ includeToolDescriptions: true }),
      new AtFileProcessorModifier({ enableRecursiveSearch: true }),
    ],
    baseSystemPrompt: systemPrompt,
  });

  let prompt = await promptGenerator.processMessage(reqMessage);
  let completed = false;
  let executionResult = null;
  let turnCount = 0;
  const maxTurns = 18;

  do {
    turnCount += 1;
    const agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] });
    const result = await agent.executeStep(reqMessage, prompt);
    prompt = result.nextMessage;

    const responseExecutor = new ResponseExecutor({ preToolCallProcessors: [], postToolCallProcessors: [] });
    executionResult = await responseExecutor.executeResponse({
      initialUserMessage: reqMessage,
      actualMessageSentToLLM: result.actualMessageSentToLLM,
      rawLLMOutput: result.rawLLMResponse,
      nextMessage: result.nextMessage,
    });

    completed = executionResult.completed;
    prompt = executionResult.nextMessage;
  } while (!completed && turnCount < maxTurns);

  if (!completed) {
    throw new Error(`Mini-agent loop reached ${maxTurns} turns without completion.`);
  }

  return executionResult;
}

async function runActionBlockMiniAgent(threadContext) {
  const params = threadContext && threadContext.params ? threadContext.params : {};
  const spec = normalizeSpec(params.spec || params);
  const agentLoop = {
    reference: spec.agentLoopReference,
    steps: ['understand', 'read-references', 'write-with-tools', 'verify', 'repair-if-needed'],
    maxRepairPasses: 1,
  };

  try {
    await codebolt.chat.sendMessage('[plugin] mini-agent loop started', {
      targetDirectory: spec.targetDirectory,
      platformAwareness: spec.platformAwareness,
      referencePaths: spec.referencePaths,
      agentLoop,
    });

    const firstExecution = await runAgentLoopForSpec(spec, []);
    let verification = verifyArtifact(spec);

    if (!verification.passed) {
      await codebolt.chat.sendMessage('[plugin] mini-agent repair loop started', verification);
      await runAgentLoopForSpec(spec, verification.errors);
      verification = verifyArtifact(spec);
    }

    const filesCreated = collectFiles(spec.targetDirectory);
    return {
      success: verification.passed,
      artifactPath: spec.targetDirectory,
      filesCreated,
      verification,
      agentLoop,
      finalMessage: firstExecution && firstExecution.finalMessage,
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

(codebolt as any).onActionBlockInvocation((threadContext) => runActionBlockMiniAgent(threadContext));

export { runActionBlockMiniAgent };

export const __test = {
  normalizeSpec,
  buildMiniAgentSystemPrompt,
  buildMiniAgentUserMessage,
  verifyArtifact,
};
