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
  ["Documents", "codeboltai"].join(path.sep),
  ["codeboltjs", "agents"].join("/"),
  ["packages", "server", "src"].join("/"),
];

const PLATFORM_CONTRACT = {
  artifactType: "tool",
  roleName: "CodeBolt local MCP tool generator mini-agent",
  createLocation: ".codebolt/tools/<name>",
  loader: "The server scans the active project .codebolt/tools folder, reads each codebolttool.yaml, and starts root index.js with node as a stdio MCP server.",
  runtimeUse: "Agents request toolbox local/<uniqueName>; the server calls listTools/callTool on the MCP server launched from index.js.",
  requiredFiles: ["codebolttool.yaml", "index.js", "README.md"],
  optionalFiles: ["package.json", "src/index.ts", "tsconfig.json"],
  manifestExpectations: [
    "codebolttool.yaml includes name, uniqueName, version, description, and optional env_required.",
    "uniqueName is kebab-case and matches the folder name unless the user explicitly asked otherwise.",
    "index.js is the root runtime file because getLocalMCPConfigs launches node <toolPath>/index.js.",
    "The MCP server exposes at least one tool with a JSON object input schema and structured text or JSON output.",
    "Each exposed tool input schema includes an optional explanation string matching CodeBolt BaseDeclarativeTool behavior.",
  ],
  runtimeFlow: [
    "Create the target directory under .codebolt/tools/<name>.",
    "Write a root index.js that starts a stdio MCP server.",
    "Implement ListTools and CallTool handlers or equivalent SDK helpers.",
    "At the start of each tool call, if arguments.explanation is present, call codebolt.chat.sendMessage(arguments.explanation) before the tool behavior.",
    "Validate inputs before running tool behavior and return clear errors for invalid arguments.",
    "Keep the runtime self-contained and avoid development repo imports.",
    "Must test tool after creation and ensure it works as expected."
  ],
  testingKnowledge: [

    "First search for the newly created tool with tool_search using its name, uniqueName, description, or primary capability.",
    "Do not skip tool_search: the required post-create runtime validation sequence is tool_search first, then execute the exact discovered local MCP tool.",
    "After tool_search returns the generated tool schema, execute the discovered tool with valid sample arguments.",
    "Do not use terminal command to test the tool. Instead use the tools provided by the Codebolt platform."
  ],
};

function titleCase(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugifyName(value, fallback) {
  const slug = String(value || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

function normalizeFeature(feature) {
  if (typeof feature === "string") {
    return { name: slugifyName(feature, "feature"), fullName: titleCase(feature), description: feature };
  }
  if (feature && typeof feature === "object") {
    const record = feature;
    const name = slugifyName(record.name || record.fullName || record.description, "feature");
    return {
      name,
      fullName: String(record.fullName || record.displayName || titleCase(name)),
      description: String(record.description || record.fullName || record.name || titleCase(name)),
    };
  }
  return { name: "feature", fullName: "Feature", description: "Feature" };
}

function formatFeature(feature) {
  if (typeof feature === "string") {
    return feature;
  }
  if (feature && typeof feature === "object") {
    return [feature.fullName || feature.name || "Feature", feature.description ? `- ${feature.description}` : ""]
      .filter(Boolean)
      .join(" ");
  }
  return String(feature || "Feature");
}

function normalizeSpec(inputSpec) {
  const spec = inputSpec && typeof inputSpec === "object" ? inputSpec : {};
  const name = slugifyName(spec.name || spec.displayName || spec.fullName, "generated-tool");
  const displayName = spec.fullName || spec.displayName ? String(spec.fullName || spec.displayName) : titleCase(name);
  const targetDirectory = spec.targetDirectory
    ? path.resolve(String(spec.targetDirectory))
    : path.resolve(process.cwd(), ".codebolt", "tools", name);

  return {
    artifactType: PLATFORM_CONTRACT.artifactType,
    name,
    fullName: displayName,
    displayName,
    description: spec.description ? String(spec.description) : "Generated CodeBolt local MCP tool",
    features: Array.isArray(spec.features) ? spec.features.map(normalizeFeature) : [],
    targetDirectory,
    projectPath: spec.projectPath ? String(spec.projectPath) : process.cwd(),
    originalRequest: spec.originalRequest ? String(spec.originalRequest) : "",
    callerConstraints: Array.isArray(spec.constraints) ? spec.constraints.map(String) : [],
    generationContext: spec.generationContext && typeof spec.generationContext === "object" ? spec.generationContext : {},
    agentLoopReference: spec.agentLoopReference
      ? String(spec.agentLoopReference)
      : "Embedded PlatformMofier mini-agent loop using @codebolt/agent/unified",
    referencePaths: Array.isArray(spec.referencePaths) ? spec.referencePaths : [],
    platformAwareness: PLATFORM_CONTRACT,
  };
}

function buildMiniAgentSystemPrompt(spec) {
  const contract = spec.platformAwareness;
  return `
You are the ${contract.roleName}.

Create the requested project-local CodeBolt tool by writing files in the target directory.
You are an ActionBlock mini-agent with planning, tool use, verification, repair, and completion.

Follow the agentic loop from:
${spec.agentLoopReference}

Feature contract:
- Artifact type: ${spec.artifactType}
- Name: ${spec.name}
- Full name: ${spec.fullName}
- Target directory: ${spec.targetDirectory}
- Canonical create location: ${contract.createLocation}
- Loader: ${contract.loader}
- Runtime use: ${contract.runtimeUse}
- Required files: ${contract.requiredFiles.join(", ")}
- Optional files: ${contract.optionalFiles.join(", ")}

Manifest expectations:
${contract.manifestExpectations.map((item) => `- ${item}`).join("\n")}

Runtime flow:
${contract.runtimeFlow.map((item) => `- ${item}`).join("\n")}

Testing knowledge the generated README must include:
${contract.testingKnowledge.map((item) => `- ${item}`).join("\n")}

Required generated-tool test sequence:
1. Reload or restart CodeBolt so .codebolt/tools is rescanned.
2. Use tool_search to search for the new tool by name, uniqueName, description, or capability.
3. Confirm the returned schema includes the expected local toolbox-qualified tool name, usually local/<uniqueName>--<toolName> at execution time and local_<uniqueName>--<toolName> in model-facing normalized form.
4. Execute the discovered tool with valid sample arguments through the available MCP execution path.
5. If the tool is not found, report that CodeBolt must be reloaded or restarted before the tool can be called; do not claim runtime validation passed.
6. Record the tool_search query, discovered name, execution call, sample arguments, and result in the README Testing section.

CodeBolt tool schema and chat-message behavior:
- CodeBolt BaseDeclarativeTool automatically adds an optional explanation parameter to every OpenAI tool schema.
- Project-local MCP tools generated here must mirror that behavior by exposing explanation in each tool input schema.
- The explanation field is a one-sentence reason for why the tool is being used and how it contributes to the goal.
- When a tool call starts, read request.params.arguments.explanation or the equivalent validated arguments.explanation and call codebolt.chat.sendMessage(explanation) if it is present.
- If the generated runtime uses codebolt.chat.sendMessage, include @codebolt/codeboltjs in package.json dependencies with a published semver range.
- Do not require explanation; keep it optional and exclude it from business-logic validation except for basic string validation.

Caller constraints:
${spec.callerConstraints.length ? spec.callerConstraints.map((item) => `- ${item}`).join("\n") : "- None"}

Optional user-provided reference paths:
${spec.referencePaths.length ? spec.referencePaths.map((referencePath) => `- ${referencePath}`).join("\n") : "- None"}

Required workflow:
1. Inspect optional references if provided.
2. Create codebolttool.yaml, root index.js, README.md, and optional package/build files only if useful.
3. Ensure root index.js can run with node and starts the MCP stdio server.
4. Add optional explanation support to the tool schema and send it through codebolt.chat.sendMessage when a call starts.
5. After creating the files, use tool_search to find the generated tool, then call the discovered tool with valid sample arguments when the runtime exposes it.
6. Document how to reload CodeBolt, search for the tool with tool_search, list local/<uniqueName>, and execute the discovered tool.
7. Verify required files, syntax, manifest fields, explanation handling, README testing content, and the tool_search-then-call validation notes.
8. Call attempt_completion with JSON containing success, artifactPath, filesCreated, toolSearchQuery, discoveredToolName, executionResult or reloadRequired, and notes.

If verification errors are provided, repair exactly those issues and verify again.
`.trim();
}

function buildMiniAgentUserMessage(spec, repairErrors) {
  const repairSection = repairErrors && repairErrors.length
    ? `\n\nVerification failed. Repair these issues:\n${repairErrors.map((error) => `- ${error}`).join("\n")}`
    : "";

  return `
Create the ${spec.artifactType} artifact now.

Original user request:
${spec.originalRequest || spec.description}

Requested features:
${spec.features.length ? spec.features.map((feature) => `- ${formatFeature(feature)}`).join("\n") : "- Standard buildable local MCP tool"}

Caller generation context:
${Object.keys(spec.generationContext || {}).length ? JSON.stringify(spec.generationContext, null, 2) : "{}"}

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
        return fs.readFileSync(filePath, "utf8");
      } catch (_error) {
        return "";
      }
    })
    .join("\n");
}

function checkJsSyntax(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing JavaScript entry: ${filePath}`);
    return;
  }
  try {
    new Function(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Invalid JavaScript syntax in ${filePath}: ${error.message}`);
  }
}

function verifyReadme(targetDirectory, errors) {
  const readmePath = path.join(targetDirectory, "README.md");
  if (!fs.existsSync(readmePath)) {
    return;
  }
  const content = fs.readFileSync(readmePath, "utf8");
  if (!/testing|test plan|verification/i.test(content)) {
    errors.push("README.md must include a Testing section.");
  }
  if (!/\.codebolt\/tools|local\//.test(content)) {
    errors.push("README.md must explain the .codebolt/tools location and local/<uniqueName> toolbox name.");
  }
  if (!/(getLocalToolBoxes|listToolsFromToolBoxes|mcp_get_tools|mcp_execute_tool)/.test(content)) {
    errors.push("README.md Testing section must mention local tool discovery or MCP execution tools.");
  }
  if (!/tool_search/.test(content)) {
    errors.push("README.md Testing section must tell users to search for the generated tool with tool_search before executing it.");
  }
  if (!/(tool_search[\s\S]{0,800}(execute|mcp_execute_tool))|((execute|mcp_execute_tool)[\s\S]{0,800}tool_search)/i.test(content)) {
    errors.push("README.md Testing section must describe the sequence: tool_search first, then execute the discovered tool.");
  }
  if (!/(discovered tool|discovered name|discoveredToolName|local\/<uniqueName>|local_)/i.test(content)) {
    errors.push("README.md Testing section must record the discovered local tool name returned after tool_search.");
  }
  if (!/(reload-required|reload required|restart required|not discoverable|not found)/i.test(content)) {
    errors.push("README.md Testing section must document the reload-required fallback if tool_search cannot find the newly created local tool.");
  }
  if (!/(reload|restart|load).{0,120}CodeBolt|CodeBolt.{0,120}(reload|restart|load)/is.test(content)) {
    errors.push("README.md must explain reloading or restarting CodeBolt after generating the tool.");
  }
}

function verifyPackageJson(targetDirectory, errors) {
  const packagePath = path.join(targetDirectory, "package.json");
  if (!fs.existsSync(packagePath)) {
    return;
  }
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const dependencySections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
    for (const section of dependencySections) {
      const dependencies = packageJson[section] || {};
      for (const [dependencyName, dependencyVersion] of Object.entries(dependencies)) {
        const normalizedVersion = String(dependencyVersion).trim();
        if (/^(file:|workspace:|link:)/.test(normalizedVersion)) {
          errors.push(`${section}.${dependencyName} must use a published npm version, not ${dependencyVersion}`);
        }
        if (normalizedVersion === "*") {
          errors.push(`${section}.${dependencyName} must pin a published npm semver range instead of using a wildcard.`);
        }
      }
    }
  } catch (error) {
    errors.push(`Invalid package.json: ${error.message}`);
  }
}

function verifyExplanationBehavior(targetDirectory, errors) {
  const entryPath = path.join(targetDirectory, "index.js");
  if (!fs.existsSync(entryPath)) {
    return;
  }

  const content = fs.readFileSync(entryPath, "utf8");
  if (!/explanation/.test(content)) {
    errors.push("index.js must expose an optional explanation field in each tool input schema.");
  }
  if (!/chat\.sendMessage|sendMessage\s*\(/.test(content)) {
    errors.push("index.js must send arguments.explanation with codebolt.chat.sendMessage when a tool call starts.");
  }
  if (/chat\.sendMessage|codebolt\.chat/.test(content)) {
    const packagePath = path.join(targetDirectory, "package.json");
    if (!fs.existsSync(packagePath)) {
      errors.push("package.json must include @codebolt/codeboltjs when index.js uses codebolt.chat.sendMessage.");
      return;
    }
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      const dependencies = packageJson.dependencies || {};
      if (!dependencies["@codebolt/codeboltjs"]) {
        errors.push("package.json dependencies must include @codebolt/codeboltjs for codebolt.chat.sendMessage.");
      }
    } catch (_error) {
      // verifyPackageJson reports invalid package.json.
    }
  }
}

function verifyArtifact(spec) {
  const errors = [];
  const warnings = [];
  const targetDirectory = spec.targetDirectory;

  if (!fs.existsSync(targetDirectory)) {
    return { passed: false, errors: [`Target directory does not exist: ${targetDirectory}`], warnings };
  }

  for (const relativeFile of PLATFORM_CONTRACT.requiredFiles) {
    if (!fs.existsSync(path.join(targetDirectory, relativeFile))) {
      errors.push(`Missing required file: ${relativeFile}`);
    }
  }

  const manifestPath = path.join(targetDirectory, "codebolttool.yaml");
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, "utf8");
    for (const field of ["name", "uniqueName", "version", "description"]) {
      if (!new RegExp(`(^|\\n)${field}\\s*:`).test(manifest)) {
        errors.push(`codebolttool.yaml must include ${field}.`);
      }
    }
  }

  checkJsSyntax(path.join(targetDirectory, "index.js"), errors);
  verifyReadme(targetDirectory, errors);
  verifyPackageJson(targetDirectory, errors);
  verifyExplanationBehavior(targetDirectory, errors);

  const allContent = readAllFiles(targetDirectory);
  for (const marker of FORBIDDEN_LOCAL_REFERENCE_MARKERS) {
    if (allContent.includes(marker)) {
      errors.push(`Generated files must not contain local or development reference marker: ${marker}`);
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
  if (eventType === "agentQueueEvent") {
    const payload = eventData && eventData.payload ? eventData.payload : {};
    const content = payload.instruction || payload.content || JSON.stringify(payload);
    return appendPromptMessage(prompt, "user", `<agent_event>\n<content>${content}</content>\n</agent_event>`);
  }
  if (eventType === "backgroundAgentCompletion" || eventType === "backgroundGroupedAgentCompletion") {
    return appendPromptMessage(prompt, "assistant", `Background agent completed:\n${JSON.stringify(eventData, null, 2)}`);
  }
  return prompt;
}

const externalEventProcessor = {
  async modify(_originalRequest, createdMessage) {
    if (!eventQueue || !eventQueue.getPendingExternalEvents) {
      return createdMessage;
    }
    let nextPrompt = createdMessage;
    for (const externalEvent of eventQueue.getPendingExternalEvents()) {
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
    for (const externalEvent of eventQueue.getPendingExternalEvents()) {
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

  const agent = new CodeboltAgent({
    instructions: systemPrompt,
    enableLogging: true,
    loopDetectionService: new LoopDetectionService({ debug: true }),
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
        new IdeContextModifier({
          includeActiveFile: true,
          includeOpenFiles: true,
          includeCursorPosition: true,
          includeSelectedText: true,
        }),
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
    steps: ["understand-feature-contract", "gather-context", "plan-artifact", "write-with-tools", "run-checks", "verify-contract", "repair-if-needed", "attempt-completion"],
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
      error: verification.passed ? undefined : verification.errors.join("; "),
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
