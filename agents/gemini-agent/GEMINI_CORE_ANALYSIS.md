# Gemini CLI Core Runtime Analysis

> **Codebase:** `gemini-cli/packages/core/src/`
> **Version:** 0.28.0-nightly
> **SDK:** `@google/genai@1.30.0`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Entry Point Trace: CLI to Core](#2-entry-point-trace-cli-to-core)
3. [Prompt Construction Pipeline](#3-prompt-construction-pipeline)
4. [The Agent Loop](#4-the-agent-loop)
5. [Tool System](#5-tool-system)
6. [History Management & Compression](#6-history-management--compression)
7. [Loop Detection](#7-loop-detection)
8. [Model Routing](#8-model-routing)
9. [Retry Logic](#9-retry-logic)
10. [Token Calculation](#10-token-calculation)
11. [Policy Engine & Security](#11-policy-engine--security)
12. [Hook System](#12-hook-system)
13. [Next Speaker Checker](#13-next-speaker-checker)
14. [Session Recording & Resumption](#14-session-recording--resumption)
15. [Key Files Reference](#15-key-files-reference)
16. [Core Package Directory Structure](#16-core-package-directory-structure)

---

## 1. Architecture Overview

The Gemini CLI is a **monorepo** with two primary packages:

| Package | Path | Role |
|---------|------|------|
| `@google/gemini-cli` | `packages/cli/` | CLI entry, UI rendering (Ink/React), argument parsing, sandbox management |
| `@google/gemini-cli-core` | `packages/core/` | All runtime logic: prompts, chat, tools, policies, streaming, routing |

The CLI package is a thin UI shell. **All intelligence and runtime logic lives in `core/`.**

### High-Level Component Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GEMINI CLI CORE                                  │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Config     │  │  Prompts     │  │  Tools       │  │  Services   │ │
│  │  (god obj)   │  │  (snippets)  │  │  (registry)  │  │  (compress, │ │
│  │  ~1800 lines │  │  (~40KB)     │  │  (executor)  │  │   loop,     │ │
│  │             │  │  (provider)  │  │  (scheduler) │  │   recording)│ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                │                  │                  │        │
│  ┌──────┴──────────────────────────────────────────────────────┴──────┐ │
│  │                     GeminiClient (core/client.ts)                  │ │
│  │   sendMessageStream() → processTurn() → Turn.run()                │ │
│  └──────────────────────────┬────────────────────────────────────────┘ │
│                             │                                          │
│  ┌──────────────────────────┴────────────────────────────────────────┐ │
│  │                   GeminiChat (core/geminiChat.ts)                  │ │
│  │   sendMessageStream() → makeApiCallAndProcessStream()             │ │
│  └──────────────────────────┬────────────────────────────────────────┘ │
│                             │                                          │
│  ┌──────────────────────────┴────────────────────────────────────────┐ │
│  │              ContentGenerator (core/contentGenerator.ts)          │ │
│  │   GoogleGenAI SDK → Gemini API                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐            │
│  │  Policy   │  │  Hooks   │  │ Routing  │  │ Telemetry │            │
│  │  Engine   │  │  System  │  │ Strategy │  │  Logging  │            │
│  └───────────┘  └──────────┘  └──────────┘  └───────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Dependencies

- `@google/genai@1.30.0` — Official Gemini SDK for API communication
- `@modelcontextprotocol/sdk` — MCP client for external tool servers
- OpenTelemetry packages — Distributed tracing and telemetry

---

## 2. Entry Point Trace: CLI to Core

### Binary Entry

```
packages/cli/index.ts (shebang entry)
  └─ Bundled to: bundle/gemini.js
```

### Boot Sequence

**File:** `packages/cli/index.ts`

```typescript
#!/usr/bin/env node
import { main } from './src/gemini.js';
main().catch(async (error) => {
  await runExitCleanup();
  // Error handling and exit
});
```

### main() Function — `packages/cli/src/gemini.tsx`

```
main()
  │
  ├─ 1. loadSettings()
  │     Loads user + workspace settings from config files
  │
  ├─ 2. parseArguments(settings.merged)
  │     Parses CLI flags (--model, --sandbox, --yolo, etc.)
  │
  ├─ 3. loadCliConfig(settings.merged, sessionId, argv, ...)
  │     Creates partial Config object (core god object)
  │     Config class: packages/core/src/config/config.ts (~1800 lines)
  │
  ├─ 4. partialConfig.refreshAuth(authType)
  │     Handles authentication:
  │     - API key (GEMINI_API_KEY / GOOGLE_API_KEY)
  │     - OAuth (Google login)
  │     - Vertex AI (service accounts)
  │     - Compute ADC (GCP default credentials)
  │
  ├─ 5. Sandbox Decision
  │     ├─ loadSandboxConfig(settings, argv)
  │     │   If sandbox configured:
  │     │   └─ start_sandbox() → re-runs CLI inside sandbox
  │     └─ Else:
  │         └─ relaunchAppInChildProcess() → memory isolation
  │
  ├─ 6. loadCliConfig() [FULL]
  │     Creates complete Config with all services initialized:
  │     - ToolRegistry
  │     - PolicyEngine
  │     - HookSystem
  │     - SkillManager
  │     - AgentRegistry
  │     - McpClientManager
  │     - ModelConfigService
  │
  ├─ 7. initializeApp(config, settings)
  │     ├─ performInitialAuth() → refreshAuth() → creates ContentGenerator
  │     │   ContentGenerator wraps GoogleGenAI SDK instance
  │     │   Configured with API key, Vertex AI, HTTP options
  │     ├─ validateTheme()
  │     └─ IdeClient.connect() (if --ide-mode)
  │
  └─ 8. startInteractiveUI(config, settings, ...)
        Renders React/Ink UI
        User interactions → GeminiClient.sendMessageStream()
```

### ContentGenerator Creation

**File:** `packages/core/src/core/contentGenerator.ts`

```typescript
// Step 1: Build config
createContentGeneratorConfig(config, authType) → ContentGeneratorConfig
  - Loads API keys from env vars
  - Determines auth mechanism (bearer / x-goog-api-key)
  - Configures Vertex AI if needed

// Step 2: Create generator
createContentGenerator(contentGeneratorConfig, gcConfig, sessionId) → ContentGenerator
  - Creates GoogleGenAI SDK instance:
    new GoogleGenAI({
      apiKey,
      vertexai,
      httpOptions: { headers: { 'User-Agent', 'x-goog-api-client', ... } }
    })
  - Wraps in LoggingContentGenerator for telemetry
```

---

## 3. Prompt Construction Pipeline

Prompts are constructed in **four stages** before the first API call, then **maintained dynamically** across turns.

### Stage A: Environment Context → Initial Chat History

**File:** `packages/core/src/utils/environmentContext.ts`

```typescript
getInitialChatHistory(config, extraHistory?) → Content[]
```

Constructs the **first user message** in the conversation:

```
This is the Gemini CLI. We are setting up the context for our chat.
Today's date is Thursday, February 5, 2026 (formatted according to the user's locale).
My operating system is: darwin
The project's temporary directory is: /tmp/.gemini/<hash>/
I'm currently working in the directory: /Users/user/project
Here is the folder structure of the current working directories:

<folder tree via getFolderStructure()>

<environment memory from GEMINI.md files>

Reminder: Do not return an empty response when a tool call is required.

My setup is complete. I will provide my first command in the next turn.
```

This is injected as `Content { role: 'user', parts: [{ text: ... }] }` — the model sees it as the user's opening message.

**Data Flow:**
```
getEnvironmentContext(config) → Part[]
  ├─ today = new Date().toLocaleDateString()
  ├─ platform = process.platform
  ├─ directoryContext = getDirectoryContextString(config)
  │   └─ getFolderStructure(dir, { fileService }) for each workspace dir
  ├─ tempDir = config.storage.getProjectTempDir()
  └─ environmentMemory = config.getEnvironmentMemory()

getInitialChatHistory(config, extraHistory?) → Content[]
  ├─ envParts = getEnvironmentContext(config)
  ├─ Combine into allSetupText with reminder
  └─ Return [{ role: 'user', parts: [{ text: allSetupText }] }, ...extraHistory]
```

### Stage B: System Instruction Construction

**Files:**
- `packages/core/src/core/prompts.ts` — entry point (40 lines)
- `packages/core/src/prompts/promptProvider.ts` — orchestrator (200 lines)
- `packages/core/src/prompts/snippets.ts` — template library (~40KB, 557 lines)
- `packages/core/src/prompts/utils.ts` — substitution engine (102 lines)

```typescript
getCoreSystemPrompt(config, userMemory?, interactiveOverride?) → string
  └─ new PromptProvider().getCoreSystemPrompt(config, userMemory, interactiveOverride)
```

**Two composition paths:**

#### Path 1 — Custom Template (when `GEMINI_SYSTEM_MD` env var is set)

```
Load file from path → applySubstitutions(template, config, skillsPrompt)
  Replaces: ${AgentSkills}, ${SubAgents}, ${AvailableTools}, ${ToolName_*}
```

#### Path 2 — Standard Composition (default)

```
PromptProvider.getCoreSystemPrompt()
  │
  ├─ Build SystemPromptOptions object:
  │   ├─ preamble: { interactive }
  │   ├─ coreMandates: { interactive, isGemini3, hasSkills }
  │   ├─ agentContexts: agentRegistry.getDirectoryContext()
  │   ├─ agentSkills: [{ name, description, location }]
  │   ├─ hookContext: true/false
  │   ├─ primaryWorkflows: { interactive, enableCodebaseInvestigator, enableWriteTodosTool }
  │   │   OR planningWorkflow: { planModeToolsList, plansDir }
  │   ├─ operationalGuidelines: { interactive, isGemini3, enableShellEfficiency }
  │   ├─ sandbox: 'macos-seatbelt' | 'generic' | 'outside'
  │   ├─ gitRepo: { interactive }
  │   └─ finalReminder: { readFileToolName }
  │
  ├─ snippets.getCoreSystemPrompt(options)
  │   Concatenation order:
  │   1. renderPreamble()              → Agent identity & role
  │   2. renderCoreMandates()          → Core behavioral rules
  │   3. renderAgentContexts()         → Sub-agent directory context
  │   4. renderAgentSkills()           → Skill descriptions & activation
  │   5. renderHookContext()           → External hook data
  │   6. renderPlanningWorkflow()      → Plan mode (if plan mode active)
  │      OR renderPrimaryWorkflows()   → Standard workflows (if not plan mode)
  │   7. renderOperationalGuidelines() → Tone, security, tool usage rules
  │   8. renderSandbox()               → Sandbox context
  │   9. renderGitRepo()               → Git guidelines
  │   10. renderFinalReminder()        → Final instructions
  │
  ├─ renderFinalShell(basePrompt, userMemory)
  │   Appends user memory section after "---" separator
  │
  ├─ Sanitize: finalPrompt.replace(/\n{3,}/g, '\n\n')
  │
  └─ maybeWriteSystemMd() if GEMINI_WRITE_SYSTEM_MD env var set
```

**Conditional section control:**
- Each section guarded by `isSectionEnabled(key)` checking `GEMINI_PROMPT_*` env vars
- e.g., `GEMINI_PROMPT_PREAMBLE=false` disables preamble section
- Plan mode guard: `isPlanMode` toggles between `primaryWorkflows` and `planningWorkflow`
- Git guard: Only renders if `isGitRepository(process.cwd())` is true

**System instruction is passed as `GenerateContentConfig.systemInstruction`** — a separate field from conversation `contents[]`, always present but never part of turn history.

### Stage C: Tool Declarations

**File:** `packages/core/src/core/client.ts:322-324`

```typescript
const toolDeclarations = toolRegistry.getFunctionDeclarations();
const tools: Tool[] = [{ functionDeclarations: toolDeclarations }];
```

Tool declarations are OpenAPI-style function schemas gathered from:
- **Built-in tools:** read-file, write-file, edit, shell, grep, glob, web-fetch, web-search, memory, ls, ripGrep
- **MCP tools:** Dynamically registered via Model Context Protocol
- **Discovered tools:** External tool definitions loaded from spawned processes

Passed as `GenerateContentConfig.tools` — the model uses them for function calling.

### Stage D: Chat Session Assembly

**File:** `packages/core/src/core/client.ts:315-349`

```typescript
GeminiClient.startChat(extraHistory?, resumedSessionData?) → GeminiChat
  ├─ tools = [{ functionDeclarations: toolRegistry.getFunctionDeclarations() }]  // Stage C
  ├─ history = getInitialChatHistory(config, extraHistory)                       // Stage A
  ├─ systemMemory = config.isJitContextEnabled()
  │    ? config.getGlobalMemory() : config.getUserMemory()
  ├─ systemInstruction = getCoreSystemPrompt(config, systemMemory)               // Stage B
  └─ return new GeminiChat(config, systemInstruction, tools, history, resumedSessionData)
```

### Prompt State at Each Execution Stage

| Stage | What's in the Prompt | Where It Lives |
|-------|---------------------|----------------|
| **Chat Init** | System instruction (identity + rules + tools description, ~40KB) | `GeminiChat.systemInstruction` |
| **Chat Init** | Environment context (date, OS, folder tree, memory) | `history[0]` as user message |
| **Chat Init** | Tool function declarations (OpenAPI schemas) | `GeminiChat.tools` |
| **User Turn** | User's typed message | Appended to `history[]` |
| **IDE Context** | Active file, cursor, open files (full on first turn, delta updates after) | Injected as user message before turn |
| **Hook Context** | BeforeAgent hook additions | Appended to request as `<hook_context>...</hook_context>` |
| **API Call** | BeforeModel hook can modify config + contents | Applied in `makeApiCallAndProcessStream()` |
| **API Call** | BeforeToolSelection hook can modify tools/toolConfig | Applied in `makeApiCallAndProcessStream()` |
| **Model Response** | Text, thoughts, function calls, citations | Added to `history[]` as model message |
| **Tool Results** | `functionResponse` parts | Added to `history[]` as user message |
| **Compression** | Old turns summarized, tool outputs truncated to 30 lines | History rewritten in-place |
| **Retry** | "System: Please continue." injected | New user message on invalid stream |
| **Next Speaker** | "Please continue." injected | New user message if model should continue |

---

## 4. The Agent Loop

### Complete Execution Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│  USER INPUT                                                          │
│  "Fix the bug in auth.ts"                                           │
└──────────────┬───────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  GeminiClient.sendMessageStream(request, signal, prompt_id)          │
│  File: core/client.ts:759-895                                        │
│                                                                      │
│  ├─ Reset loop detector if new prompt_id                             │
│  ├─ Fire BeforeAgent hook (if hooks enabled)                         │
│  │   ├─ Can STOP → yield AgentExecutionStopped, return               │
│  │   ├─ Can BLOCK → yield AgentExecutionBlocked, return              │
│  │   └─ Can inject additionalContext → appended as <hook_context>    │
│  ├─ boundedTurns = min(turns, MAX_TURNS=100)                        │
│  │                                                                   │
│  └─ yield* processTurn() ──────────────────────────────────┐         │
│       │                                                     │         │
│       │  ◄── TOOL RESULTS RECURSIVE ◄──────────────────────┘         │
│       │                                                              │
│  Fire AfterAgent hook                                                │
│  ├─ Can STOP → yield stopped, optionally resetChat()                 │
│  └─ Can BLOCK → yield blocked, recursive sendMessageStream()         │
│                                                                      │
│  Return final Turn                                                   │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  processTurn(request, signal, prompt_id, boundedTurns)               │
│  File: core/client.ts:529-757                                        │
│                                                                      │
│  ├─ 1. Session turn limit check (configurable, default uncapped)     │
│  │      If exceeded → yield MaxSessionTurns, return                  │
│  │                                                                   │
│  ├─ 2. Bounded turns exhaustion check                                │
│  │      If 0 → return empty turn                                     │
│  │                                                                   │
│  ├─ 3. tryCompressChat(prompt_id, force=false)                       │
│  │      If token count > 50% of limit → compress history             │
│  │      Yield ChatCompressed event if triggered                      │
│  │                                                                   │
│  ├─ 4. Context window overflow check                                 │
│  │      estimatedRequestTokenCount > remainingTokenCount             │
│  │      → yield ContextWindowWillOverflow, return                    │
│  │                                                                   │
│  ├─ 5. IDE context injection (if IDE mode & no pending tool call)    │
│  │      First turn: full JSON context (activeFile, cursor, openFiles)│
│  │      Subsequent: delta updates (filesOpened, filesClosed, etc.)   │
│  │                                                                   │
│  ├─ 6. Loop detection check (pre-turn)                               │
│  │      If loopDetected → yield LoopDetected, return                 │
│  │                                                                   │
│  ├─ 7. Model routing                                                 │
│  │      ├─ Sticky model (if mid-sequence) → reuse same model        │
│  │      ├─ ModelRouterService.route() → strategy chain decision      │
│  │      └─ applyModelSelection() → availability + fallback           │
│  │      yield ModelInfo event (if not mid-sequence)                   │
│  │                                                                   │
│  ├─ 8. Turn.run(modelConfigKey, request, linkedSignal)               │
│  │      └─ Streams response events ─────────────────────────┐       │
│  │                                                           │       │
│  ├─ 9. Process streamed events                               │       │
│  │      for await (event of resultStream):                   │       │
│  │        ├─ Loop detection on each event                    │       │
│  │        ├─ If LoopDetected → abort, return                 │       │
│  │        ├─ yield event to caller                           │       │
│  │        └─ Update telemetry token count                    │       │
│  │                                                           │       │
│  ├─ 10. If error → return turn                               │       │
│  │                                                           │       │
│  ├─ 11. Invalid stream handling                              │       │
│  │       If isInvalidStream AND continueOnFailedApiCall:     │       │
│  │       ├─ If already retried → return                      │       │
│  │       └─ Recursive sendMessageStream(                     │       │
│  │            "System: Please continue.", turns-1, retry=true│       │
│  │          )                                                │       │
│  │                                                           │       │
│  └─ 12. Next speaker check (if no pending tools)            │       │
│          ├─ LLM evaluates if model should continue           │       │
│          └─ If yes → recursive sendMessageStream(            │       │
│               "Please continue.", turns-1                    │       │
│             )                                                │       │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Turn.run(modelConfigKey, request, signal)                           │
│  File: core/turn.ts:247-395                                          │
│                                                                      │
│  ├─ chat.sendMessageStream(modelConfigKey, message, prompt_id, sig)  │
│  │   Returns AsyncGenerator<StreamEvent>                             │
│  │                                                                   │
│  └─ for await (event of stream):                                     │
│       ├─ CHUNK → process GenerateContentResponse                     │
│       │   ├─ Extract thoughts → yield Thought events                 │
│       │   ├─ Extract text → yield Content events                     │
│       │   ├─ Extract functionCalls → handlePendingFunctionCall()     │
│       │   │   └─ Create ToolCallRequestInfo { callId, name, args }   │
│       │   │   └─ Add to turn.pendingToolCalls[]                      │
│       │   │   └─ Yield ToolCallRequest event                         │
│       │   ├─ Extract citations → yield Citation events               │
│       │   └─ Check finish reason → yield Finished event              │
│       │                                                              │
│       ├─ RETRY → yield Retry event                                   │
│       ├─ AGENT_EXECUTION_STOPPED → yield stop event                  │
│       └─ AGENT_EXECUTION_BLOCKED → yield block event                 │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  GeminiChat.sendMessageStream()                                      │
│  File: core/geminiChat.ts:289-455                                    │
│                                                                      │
│  ├─ await this.sendPromise (serialization — one stream at a time)    │
│  ├─ userContent = createUserContent(message)                         │
│  ├─ Record user message via ChatRecordingService                     │
│  ├─ this.history.push(userContent)                                   │
│  ├─ requestContents = this.getHistory(curated=true)                  │
│  │                                                                   │
│  └─ streamWithRetries():                                             │
│       for (attempt = 0; attempt < 2; attempt++):                     │
│         ├─ If retry → yield RETRY event                              │
│         ├─ stream = makeApiCallAndProcessStream(...)                  │
│         ├─ for await (chunk of stream):                              │
│         │   yield { type: CHUNK, value: chunk }                      │
│         ├─ On InvalidStreamError → retry (if Gemini 2.x)            │
│         ├─ On AgentExecutionStopped → yield stop, return             │
│         ├─ On AgentExecutionBlocked → yield block, return            │
│         └─ On connection error → throw (no retry for connection)     │
└──────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│  GeminiChat.makeApiCallAndProcessStream()                            │
│  File: core/geminiChat.ts:457-695                                    │
│  THE ACTUAL API CALL                                                 │
│                                                                      │
│  ├─ ensureActiveLoopHasThoughtSignatures() (preview models only)     │
│  │   Adds SYNTHETIC_THOUGHT_SIGNATURE to prevent validator errors     │
│  │                                                                   │
│  ├─ applyModelSelection() → resolve final model + config             │
│  │                                                                   │
│  ├─ apiCall closure:                                                 │
│  │   ├─ Resolve model (handle fallback changes mid-retry)            │
│  │   │                                                               │
│  │   ├─ Build GenerateContentConfig:                                 │
│  │   │   {                                                           │
│  │   │     ...modelSpecificConfig,                                   │
│  │   │     systemInstruction: this.systemInstruction,  // Stage B    │
│  │   │     tools: this.tools,                          // Stage C    │
│  │   │     abortSignal                                               │
│  │   │   }                                                           │
│  │   │                                                               │
│  │   ├─ BeforeModel hook:                                            │
│  │   │   ├─ Can modify config (temperature, etc.)                    │
│  │   │   ├─ Can modify contents (inject/remove messages)             │
│  │   │   ├─ Can STOP → throw AgentExecutionStoppedError              │
│  │   │   └─ Can BLOCK → throw AgentExecutionBlockedError             │
│  │   │                                                               │
│  │   ├─ BeforeToolSelection hook:                                    │
│  │   │   ├─ Can modify toolConfig (function calling mode)            │
│  │   │   └─ Can replace tools entirely                               │
│  │   │                                                               │
│  │   └─ contentGenerator.generateContentStream({                     │
│  │        model: "gemini-2.5-pro",                                   │
│  │        contents: Content[],    ← full curated history             │
│  │        config: {                                                  │
│  │          systemInstruction,    ← from Stage B                     │
│  │          tools,                ← from Stage C                     │
│  │          toolConfig,           ← function calling mode            │
│  │          ...modelSpecificConfig                                   │
│  │        }                                                          │
│  │      }, prompt_id)                                                │
│  │                                                                   │
│  └─ retryWithBackoff(apiCall, {                                      │
│       onPersistent429: handleFallback,                               │
│       onValidationRequired: handler,                                 │
│       maxAttempts, signal,                                           │
│       getAvailabilityContext                                         │
│     })                                                               │
└──────────────────────────────────────────────────────────────────────┘
```

### Event Types (GeminiEventType enum)

**File:** `core/turn.ts:52-71`

| Event | Description |
|-------|-------------|
| `Content` | Text response chunks |
| `ToolCallRequest` | Model requests tool execution |
| `ToolCallResponse` | Tool execution result |
| `ToolCallConfirmation` | User approval for tool |
| `UserCancelled` | User aborted execution |
| `Error` | Execution error |
| `ChatCompressed` | History compression applied |
| `Thought` | Model's reasoning (extended thinking) |
| `MaxSessionTurns` | Session limit reached |
| `Finished` | Turn completed with finish reason |
| `LoopDetected` | Infinite loop detected |
| `Citation` | Source attribution |
| `Retry` | Stream retry triggered |
| `ContextWindowWillOverflow` | Token limit warning |
| `InvalidStream` | Malformed API response |
| `ModelInfo` | Selected model identifier |
| `AgentExecutionStopped` | Hook-triggered stop |
| `AgentExecutionBlocked` | Hook-triggered block |

---

## 5. Tool System

### Tool Registry

**File:** `packages/core/src/tools/tool-registry.ts`

Manages all registered tools via `allKnownTools: Map<string, AnyDeclarativeTool>`.

**Key methods:**
- `registerTool(tool)` — Add tool to registry
- `getFunctionDeclarations()` — Returns OpenAPI schemas for all **active** tools (excluded tools filtered out)
- `getAllToolNames()` — Returns names of all **active** tools
- `getTool(name)` — Lookup by name (supports legacy aliases and MCP qualified names)
- `discoverAllTools()` — Spawns discovery command, parses JSON output, registers DiscoveredTool instances

**Tool sorting priority:**
1. Built-in tools (priority 0)
2. Discovered tools (priority 1)
3. MCP tools (priority 2, sorted by server name)

### Built-in Tools

| Tool | File | Kind | Description |
|------|------|------|-------------|
| `read_file` | `tools/read-file.ts` | Read | Read file contents |
| `write_file` | `tools/write-file.ts` | Edit | Write/create files |
| `edit` | `tools/edit.ts` | Edit | String replacement edits |
| `shell` | `tools/shell.ts` | Execute | Execute shell commands |
| `grep` | `tools/grep.ts` | Search | Content search (ripgrep) |
| `ripGrep` | `tools/ripGrep.ts` | Search | Content search (ripgrep variant) |
| `glob` | `tools/glob.ts` | Search | File pattern matching |
| `ls` | `tools/ls.ts` | Read | Directory listing |
| `web_fetch` | `tools/web-fetch.ts` | Fetch | Fetch web content |
| `web_search` | `tools/web-search.ts` | Fetch | Web search |
| `memory` | `tools/memoryTool.ts` | Other | Persistent memory read/write |
| MCP tools | `tools/mcp-tool.ts` | Varies | Dynamic MCP protocol tools |

### Tool Execution State Machine

**File:** `packages/core/src/core/coreToolScheduler.ts`

The `CoreToolScheduler` manages tool calls through a **sequential single-active queue model** with 7 states:

```
         schedule() / _schedule()
                  │
                  ▼
        ┌─────────────────┐
        │   validating    │  Build invocation + validate params
        └────────┬────────┘
                 │
         PolicyEngine.evaluate()
                 │
         ┌───────┴────────┐
         │                │
    ALLOW / ALWAYS    ASK_USER
         │                │
         │                ▼
         │    ┌──────────────────────┐
         │    │  awaiting_approval   │ ← shouldConfirmExecute()
         │    │  (user confirmation) │   Shows diff/command preview
         │    └──────────┬───────────┘
         │               │
         │    handleConfirmationResponse()
         │               │
         │    ┌──────────┴──────────────┐
         │    │                         │
         │    │ ProceedOnce/Always      │ Cancel
         │    ▼                         ▼
         └──► scheduled         → cancelled (terminal)
                 │
         attemptExecutionOfScheduledCalls()
                 │
                 ▼
            executing  ← setPidCallback for shell tools
                 │
         ToolExecutor.execute()
         └─ executeToolWithHooks()
            ├─ BeforeTool hook
            ├─ invocation.execute()
            └─ AfterTool hook
                 │
        ┌────────┴────────┐
        ▼                 ▼
     success            error
    (terminal)         (terminal)

    DENY from PolicyEngine
         │
         ▼
       error (terminal) with denyMessage
```

**Queue architecture:**
- `toolCalls[]` — Active tool (0 or 1 element)
- `toolCallQueue[]` — Pending tools
- `completedToolCallsForBatch[]` — Completed tools
- `requestQueue[]` — Queued scheduling requests

Tools execute **one at a time sequentially**. When a batch completes, `onAllToolCallsComplete` callback fires, which adds `functionResponse` parts to chat history and triggers the next recursive `sendMessageStream()` call.

### Tool Executor

**File:** `packages/core/src/scheduler/tool-executor.ts`

```
ToolExecutor.execute(context) → CompletedToolCall
  │
  ├─ Validate tool & invocation exist
  ├─ Setup liveOutputCallback (if tool.canUpdateOutput)
  ├─ Get shellExecutionConfig from config
  │
  ├─ executeToolWithHooks(invocation, toolName, signal, tool, ...)
  │   File: core/coreToolHookTriggers.ts
  │   │
  │   ├─ Extract MCP context (if MCP tool)
  │   ├─ Fire BeforeTool hook
  │   │   ├─ Can STOP → return error with STOP_EXECUTION
  │   │   ├─ Can BLOCK → return error with EXECUTION_FAILED
  │   │   └─ Can modify tool input → rebuild invocation
  │   │
  │   ├─ invocation.execute(signal, updateOutput, shellConfig, setPidCallback)
  │   │
  │   ├─ Append modification notice if input was modified
  │   │
  │   └─ Fire AfterTool hook
  │       ├─ Can STOP → return error
  │       ├─ Can BLOCK → return error
  │       └─ Can add context → append <hook_context> to result
  │
  ├─ Check signal.aborted → CancelledToolCall
  ├─ Check result.error → ErroredToolCall
  └─ No error → SuccessfulToolCall (with optional output truncation)
```

---

## 6. History Management & Compression

### History Structure

```typescript
// Content[] from @google/genai
[
  { role: 'user',  parts: [{ text: "environment setup..." }] },      // Initial context
  { role: 'user',  parts: [{ text: "IDE context JSON..." }] },       // IDE context
  { role: 'user',  parts: [{ text: "Fix the bug in auth.ts" }] },    // User message
  { role: 'model', parts: [{ text: "I'll..." }, { functionCall: { name: "read_file", args: {...} } }] },
  { role: 'user',  parts: [{ functionResponse: { name: "read_file", response: {...} } }] },
  { role: 'model', parts: [{ text: "Found the issue..." }] },
  ...
]
```

### Dual History Tracking

- **Comprehensive history** — All turns including empty/invalid model responses (internal tracking)
- **Curated history** — Only valid user→model exchanges (sent to API)

`extractCuratedHistory(comprehensiveHistory)` filters out invalid model outputs (empty responses, malformed function calls) to prevent API errors.

History is returned via `structuredClone()` to prevent external mutations.

### Chat Compression Service

**File:** `packages/core/src/services/chatCompressionService.ts`

#### Thresholds

| Constant | Value | Purpose |
|----------|-------|---------|
| `DEFAULT_COMPRESSION_TOKEN_THRESHOLD` | 0.5 | Trigger when > 50% of model token limit |
| `COMPRESSION_PRESERVE_THRESHOLD` | 0.3 | Keep last 30% at full fidelity |
| `COMPRESSION_FUNCTION_RESPONSE_TOKEN_BUDGET` | 50,000 | Max tokens for tool output preservation |
| `COMPRESSION_TRUNCATE_LINES` | 30 | Old tool outputs truncated to last 30 lines |

#### Compression Algorithm

```
compress(chat, prompt_id, force, model, config, hasFailedAttempt) → { newHistory, info }
  │
  ├─ 1. Validate: history not empty, no prior failed attempts
  │
  ├─ 2. Fire PreCompress hook
  │
  ├─ 3. Check threshold: originalTokenCount < 0.5 * tokenLimit(model)?
  │      If yes → skip (return NOOP)
  │
  ├─ 4. truncateHistoryToBudget(history, config)
  │      Iterate BACKWARDS (newest to oldest):
  │      ├─ Track function response token count
  │      ├─ Recent turns → keep at full fidelity
  │      ├─ Old large tool outputs → truncate to last 30 lines
  │      ├─ Save truncated content to temp files
  │      └─ Return compressed history with truncated placeholders
  │
  ├─ 5. findCompressSplitPoint(contents, 0.7)
  │      Find safe split point at 70% mark:
  │      ├─ Iterate through contents tracking character count
  │      ├─ Only split at user messages WITHOUT function responses
  │      └─ Return index of oldest item to keep
  │
  ├─ 6. Summarize older portion via LLM
  │      ├─ Use compression system prompt (getCompressionPrompt())
  │      ├─ Feed older history to LLM
  │      └─ Get XML <state_snapshot> summary
  │
  ├─ 7. Verification turn
  │      Second lightweight LLM call for self-correction of snapshot
  │
  ├─ 8. Construct new history:
  │      [summary_user_msg, model_ack, ...preserved_recent_history]
  │
  ├─ 9. Validate reduction: newTokenCount < originalTokenCount?
  │      If inflated → return COMPRESSION_FAILED_INFLATED_TOKEN_COUNT
  │
  └─ 10. Create new GeminiChat with compressed history
```

---

## 7. Loop Detection

**File:** `packages/core/src/services/loopDetectionService.ts`

Three detection methods working in concert:

### Method 1: Tool Call Loop Detection

| Threshold | Value |
|-----------|-------|
| `TOOL_CALL_LOOP_THRESHOLD` | 5 consecutive identical tool calls |

```
checkToolCallLoop(toolCall)
  ├─ Hash: SHA256(toolName + ":" + JSON.stringify(args))
  ├─ Compare with previous tool call hash
  ├─ If identical → increment counter
  └─ If counter >= 5 → LOOP DETECTED
```

### Method 2: Content Chunk Loop Detection

| Threshold | Value |
|-----------|-------|
| `CONTENT_LOOP_THRESHOLD` | 10 repetitive chunks |
| `CONTENT_CHUNK_SIZE` | 50 characters |
| `MAX_HISTORY_LENGTH` | 5,000 characters |

```
checkContentLoop(content)
  ├─ Detect content type changes (code blocks, tables, lists, headings)
  ├─ Reset tracking on structure changes
  ├─ Accumulate streaming content into history
  ├─ Truncate if > 5,000 characters
  └─ analyzeContentChunksForLoop():
      ├─ Sliding window of 50-char chunks
      ├─ SHA256 hash each chunk
      ├─ Track positions where identical chunks appear
      └─ LOOP if same chunk appears 10+ times
           within average distance ≤ 250 chars
```

### Method 3: LLM-Based Loop Detection

| Threshold | Value |
|-----------|-------|
| `LLM_CHECK_AFTER_TURNS` | 30 turns minimum |
| `DEFAULT_LLM_CHECK_INTERVAL` | Every 3 turns |
| `LLM_CONFIDENCE_THRESHOLD` | 0.9 |
| `MIN_LLM_CHECK_INTERVAL` | 5 turns (high confidence) |
| `MAX_LLM_CHECK_INTERVAL` | 15 turns (low confidence) |

```
checkForLoopWithLLM(signal)
  ├─ Triggered after 30+ turns
  ├─ Get last 20 turns from history
  ├─ Query 'loop-detection' model:
  │   "Is this an unproductive state?"
  │   Schema: { unproductive_state_analysis, unproductive_state_confidence: 0.0-1.0 }
  ├─ If confidence < 0.9 → adjust interval, return false
  ├─ If confidence >= 0.9 → double-check with configured model
  └─ Dynamically adjust check interval based on confidence
```

---

## 8. Model Routing

**File:** `packages/core/src/routing/`

### Composite Strategy (Priority Chain)

```
ModelRouterService.route(context) → RoutingDecision { model, metadata }
  │
  ├─ 1. FallbackStrategy
  │      Check model availability → route to first available if current unavailable
  │
  ├─ 2. OverrideStrategy
  │      If user specified non-auto model → use that model
  │
  ├─ 3. ClassifierStrategy (LLM-based)
  │      Query LLM: "Is this task FLASH (simple) or PRO (complex)?"
  │      PRO = 4+ steps, strategic planning, high ambiguity, deep debugging
  │      FLASH = specific, bounded, 1-3 steps
  │
  ├─ 4. NumericalClassifierStrategy
  │      Score 1-100 complexity rubric:
  │        1-20: Trivial (single operations)
  │        21-50: Standard (single-file edits)
  │        51-80: High complexity (multi-file, debugging)
  │        81-100: Extreme (architectural)
  │      Threshold: FNV-1a hash of sessionId → 50% split (50 or 80)
  │      Decision: score >= threshold ? PRO : FLASH
  │
  └─ 5. DefaultStrategy (terminal)
         Returns configured default model
```

### Model Constants

| Alias | Preview (Gemini 3) | Default (Gemini 2.5) |
|-------|--------------------|---------------------|
| `pro` | `gemini-3-pro-preview` | `gemini-2.5-pro` |
| `flash` | `gemini-3-flash-preview` | `gemini-2.5-flash` |
| `flash-lite` | N/A | `gemini-2.5-flash-lite` |
| `auto` | Routes to pro/flash | Routes to pro/flash |

---

## 9. Retry Logic

**File:** `packages/core/src/utils/retry.ts`

### Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxAttempts` | 3 | Total attempts |
| `initialDelayMs` | 5,000ms | First delay |
| `maxDelayMs` | 30,000ms | Max delay cap |

### Backoff Algorithm

```
currentDelay = min(currentDelay * 2, maxDelayMs)   // Exponential
jitter = random * 0.6 * currentDelay - 0.3 * currentDelay  // ±30%
delayWithJitter = max(0, currentDelay + jitter)
```

### Error Classification

| Error Type | Retry? | Action |
|------------|--------|--------|
| Network (ECONNRESET, ETIMEDOUT, etc.) | Yes | Exponential backoff |
| HTTP 429 (rate limit) | Yes | Server delay or backoff |
| HTTP 5xx | Yes | Exponential backoff |
| HTTP 400 | **No** | Throw immediately |
| TerminalQuotaError | **No** | Trigger fallback model |
| ValidationRequiredError | **No** | Call user validation handler |
| RetryableQuotaError | Yes | Server-provided delay or backoff |

### Fallback Handler

**File:** `packages/core/src/fallback/handler.ts`

```
handleFallback(config, model, authType, error)
  ├─ Only works with LoginWithGoogle auth
  ├─ Build fallback policy context
  ├─ Select first available candidate model
  ├─ Determine intent:
  │   ├─ retry_always → permanent fallback
  │   ├─ retry_once → single retry with different model
  │   ├─ stop → no switch
  │   ├─ retry_later → no switch, try again later
  │   └─ upgrade → open browser to upgrade URL
  └─ Apply availability transitions
```

---

## 10. Token Calculation

**File:** `packages/core/src/utils/tokenCalculation.ts`

### Heuristic Constants

| Content Type | Estimation |
|-------------|------------|
| ASCII characters (0-127) | 0.25 tokens/char (4 chars per token) |
| Non-ASCII/CJK | 1.3 tokens/char |
| Images (up to 4K) | 3,000 tokens fixed |
| PDFs (~100 pages) | 25,800 tokens fixed |
| Text > 100K chars | `length / 4` quick approximation |

### Estimation Flow

```
estimateTokenCountSync(parts: Part[]) → number
  For each part:
    ├─ text → character-by-character ASCII/non-ASCII
    ├─ inlineData (image) → 3,000 tokens
    ├─ fileData (PDF) → 25,800 tokens
    ├─ functionResponse → stringify and /4
    └─ other → JSON.stringify and /4

calculateRequestTokenCount(request, contentGenerator, model) → number
  ├─ If media present → use countTokens API (with fallback to estimation)
  └─ Else → direct local estimation
```

---

## 11. Policy Engine & Security

**File:** `packages/core/src/policy/policy-engine.ts`

### Policy Decision Flow

```
PolicyEngine.evaluate(toolName, args, approvalMode) → ALLOW | DENY | ASK_USER

Rule matching (in priority order):
  1. Approval mode filter (DEFAULT, AUTO_EDIT, YOLO, PLAN)
  2. Tool name matching (exact or wildcard: "serverName__*")
  3. Arguments regex pattern matching (on stable JSON-stringified args)
  4. Priority-based resolution (highest priority wins)
```

### Special Protections

- **Shell redirection detection:** Downgrades ALLOW to ASK_USER if redirection detected (unless `allowRedirection: true`)
- **Command analysis:** Detects dangerous patterns in shell commands
- **YOLO mode:** Auto-approves everything (user opted in)
- **PLAN mode:** Read-only tools only

### Approval Modes

| Mode | Behavior |
|------|----------|
| `DEFAULT` | Interactive, ask on ASK_USER |
| `AUTO_EDIT` | Auto-approve file edits |
| `YOLO` | Auto-approve everything |
| `PLAN` | Read-only tools only |

---

## 12. Hook System

Six hook points in the execution pipeline:

| Hook | When | Can Modify | File |
|------|------|-----------|------|
| **BeforeAgent** | Before `sendMessageStream` | Request, can stop/block, inject `<hook_context>` | `core/client.ts:122-177` |
| **AfterAgent** | After turn completion | Can request context clear, can stop/block | `core/client.ts:179-205` |
| **BeforeModel** | Before API call | Config, contents, can stop/block | `core/geminiChat.ts:526-562` |
| **BeforeToolSelection** | After BeforeModel | toolConfig, tools list | `core/geminiChat.ts:564-579` |
| **BeforeTool** | Before tool execution | Tool input, can stop/block | `core/coreToolHookTriggers.ts:66-130` |
| **AfterTool** | After tool execution | Can add `<hook_context>`, can stop/block | `core/coreToolHookTriggers.ts:132-175` |

---

## 13. Next Speaker Checker

**File:** `packages/core/src/utils/nextSpeakerChecker.ts`

After the model completes a turn without tool calls, determines if the model should continue speaking.

### Fast-Path Returns (No LLM Call)

- Empty history → `null`
- Last message is function response → `'model'`
- Last message is empty model message → `'model'`

### LLM Check

```
checkNextSpeaker(chat, baseLlmClient, signal, prompt_id) → { next_speaker: 'user'|'model' } | null
  ├─ Use curated history
  ├─ Query 'next-speaker-checker' model
  ├─ Decision rules:
  │   1. Model continues if: states immediate next action OR appears incomplete
  │   2. Question to user if: ends with direct question
  │   3. Waiting for user if: completed without 1 or 2
  └─ Return { reasoning, next_speaker }
```

---

## 14. Session Recording & Resumption

**File:** `packages/core/src/services/chatRecordingService.ts`

### Session File

- **Path:** `~/.gemini/tmp/<project_hash>/chats/session-YYYY-MM-DD_HH-MM-<sessionId>.json`

### ConversationRecord Schema

```typescript
{
  sessionId: string;
  projectHash: string;
  startTime: ISO8601;
  lastUpdated: ISO8601;
  messages: MessageRecord[];
  summary?: string;
  directories?: string[];
}
```

### Message Types

- **user/info/error/warning:** Basic type with content and displayContent
- **gemini:** Includes `toolCalls[]`, `thoughts[]`, `tokens`, `model`

### Token Summary (per message)

```typescript
{ input, output, cached, thoughts, tool, total }
```

### Disk I/O Strategy

- Caches last written JSON to avoid redundant writes
- Only writes if content differs
- Tolerates ENOSPC (disk full) gracefully by disabling recording

### Session Resumption

```typescript
GeminiClient.resumeChat(history, resumedSessionData)
  └─ startChat(history, resumedSessionData)
      └─ new GeminiChat(config, systemInstruction, tools, history, resumedSessionData)
```

---

## 15. Key Files Reference

| File | ~Lines | Purpose | Key Exports |
|------|--------|---------|-------------|
| `core/client.ts` | 1,060 | Main agent loop orchestrator | `GeminiClient` |
| `core/geminiChat.ts` | 700 | API communication, history, serialization | `GeminiChat`, `StreamEventType` |
| `core/turn.ts` | 420 | Single turn executor, event streaming | `Turn`, `GeminiEventType` |
| `core/prompts.ts` | 40 | Entry point for prompt generation | `getCoreSystemPrompt()` |
| `core/contentGenerator.ts` | 200 | GoogleGenAI SDK wrapper | `createContentGenerator()` |
| `core/coreToolScheduler.ts` | 1,000 | Tool execution pipeline state machine | `CoreToolScheduler` |
| `core/coreToolHookTriggers.ts` | 210 | Tool hook middleware | `executeToolWithHooks()` |
| `prompts/promptProvider.ts` | 200 | Prompt composition orchestrator | `PromptProvider` |
| `prompts/snippets.ts` | 557 (~40KB) | System prompt template library | `getCoreSystemPrompt()`, all `render*()` |
| `prompts/utils.ts` | 102 | Template substitution & section control | `applySubstitutions()`, `isSectionEnabled()` |
| `utils/environmentContext.ts` | 105 | Environment context builder | `getInitialChatHistory()` |
| `config/config.ts` | 1,800 | Central god object | `Config` |
| `config/models.ts` | 150 | Model resolution | `resolveModel()`, `isPreviewModel()` |
| `policy/policy-engine.ts` | 350 | Security policy evaluation | `PolicyEngine` |
| `services/chatCompressionService.ts` | 250 | History compression | `ChatCompressionService` |
| `services/loopDetectionService.ts` | 300 | Loop detection (3 methods) | `LoopDetectionService` |
| `services/chatRecordingService.ts` | 400 | Session recording/resumption | `ChatRecordingService` |
| `services/modelConfigService.ts` | 300 | Model config resolution | `ModelConfigService` |
| `scheduler/tool-executor.ts` | 160 | Tool invocation executor | `ToolExecutor` |
| `tools/tool-registry.ts` | 250 | Tool registration & lookup | `ToolRegistry` |
| `tools/tools.ts` | 400 | Base tool interfaces | `DeclarativeTool`, `ToolResult` |
| `utils/retry.ts` | 250 | Retry with backoff | `retryWithBackoff()` |
| `utils/tokenCalculation.ts` | 150 | Token estimation | `estimateTokenCountSync()` |
| `utils/nextSpeakerChecker.ts` | 100 | Next speaker evaluation | `checkNextSpeaker()` |
| `fallback/handler.ts` | 150 | Fallback model handling | `handleFallback()` |
| `routing/` | 400 | Model routing strategies | `ModelRouterService` |
| `index.ts` | 189 | Re-exports (public API) | All public exports |

---

## 16. Core Package Directory Structure

```
packages/core/src/
├── agents/                    # Sub-agent execution, A2A client, agent scheduling
│   ├── auth-provider/         # Auth providers for agents
│   ├── a2a-client-manager.ts  # Agent-to-Agent client
│   ├── agent-scheduler.ts     # Agent task scheduling
│   └── agentLoader.ts         # Dynamic agent loading
├── availability/              # Model availability management
│   └── policyHelpers.ts       # applyModelSelection(), createAvailabilityContextProvider()
├── code_assist/               # Code Assist integration
│   ├── admin/                 # Admin controls
│   ├── experiments/           # Feature flags
│   ├── oauth2.ts              # OAuth flow
│   └── codeAssist.ts          # Code Assist server
├── commands/                  # CLI commands
│   ├── extensions.ts          # Extension management
│   ├── restore.ts             # Session restoration
│   ├── init.ts                # Project initialization
│   └── memory.ts              # Memory management
├── config/                    # Configuration
│   ├── config.ts              # Config class (~1800 lines, god object)
│   ├── models.ts              # Model resolution + constants
│   ├── storage.ts             # Session/config file storage
│   ├── constants.ts           # Global constants
│   └── defaultModelConfigs.ts # Default model configurations
├── confirmation-bus/          # Message bus for tool confirmations
├── core/                      # Core runtime
│   ├── client.ts              # GeminiClient (main agent loop)
│   ├── geminiChat.ts          # GeminiChat (API communication)
│   ├── turn.ts                # Turn (single turn executor)
│   ├── prompts.ts             # Prompt entry point
│   ├── contentGenerator.ts    # GoogleGenAI SDK wrapper
│   ├── coreToolScheduler.ts   # Tool scheduling state machine
│   ├── coreToolHookTriggers.ts # Tool hook middleware
│   ├── baseLlmClient.ts       # Utility LLM calls
│   ├── geminiRequest.ts       # Request formatting
│   ├── logger.ts              # Core logger
│   └── tokenLimits.ts         # Per-model token limits
├── fallback/                  # Fallback model handling
│   └── handler.ts             # handleFallback()
├── hooks/                     # Hook system for extensibility
│   └── types.ts               # Hook interfaces
├── ide/                       # IDE integration
│   ├── ide-client.ts          # IDE WebSocket client
│   ├── ideContext.ts           # IDE context store
│   └── detect-ide.ts          # IDE detection
├── mcp/                       # Model Context Protocol
│   ├── oauth-provider.ts      # MCP OAuth
│   └── token-storage/         # Token persistence
├── output/                    # Output formatting
│   ├── types.ts               # Output types
│   └── json-formatter.ts      # JSON output
├── policy/                    # Security policies
│   ├── policy-engine.ts       # PolicyEngine
│   ├── toml-loader.ts         # TOML policy files
│   ├── config.ts              # Policy configuration
│   └── types.ts               # PolicyRule, ApprovalMode
├── prompts/                   # Prompt generation
│   ├── promptProvider.ts      # PromptProvider orchestrator
│   ├── snippets.ts            # Template library (~40KB)
│   └── utils.ts               # Substitution engine
├── routing/                   # Model routing
│   ├── routingStrategy.ts     # Strategy interface
│   └── strategies/            # Classifier, Numerical, Default, Fallback, Override
├── safety/                    # Safety checks
├── scheduler/                 # Task scheduling
│   ├── tool-executor.ts       # ToolExecutor
│   └── types.ts               # ToolCall state types
├── services/                  # Business logic services
│   ├── chatCompressionService.ts  # History compression
│   ├── loopDetectionService.ts    # Loop detection (3 methods)
│   ├── chatRecordingService.ts    # Session recording
│   ├── modelConfigService.ts      # Model config resolution
│   ├── fileDiscoveryService.ts    # File discovery
│   ├── gitService.ts              # Git operations
│   ├── fileSystemService.ts       # File system ops
│   ├── shellExecutionService.ts   # Shell command execution
│   └── contextManager.ts         # Context management
├── skills/                    # Skill system
│   ├── skillManager.ts        # Skill registration
│   └── skillLoader.ts         # Dynamic skill loading
├── telemetry/                 # Telemetry
│   ├── index.ts               # Telemetry entry
│   ├── loggers.ts             # Event loggers
│   ├── types.ts               # Event types
│   └── uiTelemetry.ts         # UI event tracking
├── tools/                     # Tool implementations
│   ├── tool-registry.ts       # ToolRegistry
│   ├── tools.ts               # Base interfaces (DeclarativeTool, ToolResult)
│   ├── tool-names.ts          # Tool name constants
│   ├── read-file.ts           # read_file tool
│   ├── write-file.ts          # write_file tool
│   ├── edit.ts                # edit tool
│   ├── shell.ts               # shell tool
│   ├── grep.ts                # grep tool
│   ├── ripGrep.ts             # ripgrep tool
│   ├── glob.ts                # glob tool
│   ├── ls.ts                  # ls tool
│   ├── web-fetch.ts           # web_fetch tool
│   ├── web-search.ts          # web_search tool
│   ├── memoryTool.ts          # memory tool
│   ├── mcp-client.ts          # MCP client
│   └── mcp-tool.ts            # MCP tool wrapper
├── utils/                     # Utility functions (100+ files)
│   ├── environmentContext.ts  # Initial chat history
│   ├── retry.ts               # retryWithBackoff()
│   ├── tokenCalculation.ts    # Token estimation
│   ├── nextSpeakerChecker.ts  # Next speaker check
│   ├── errors.ts              # Error types
│   ├── events.ts              # Core event emitter
│   ├── paths.ts               # Path utilities
│   └── ...                    # Many more utilities
└── index.ts                   # 189 lines of public re-exports
```

---

## 17. Agent System (Sub-Agents & Remote A2A)

The agent system enables Gemini CLI to spawn and orchestrate sub-agents — both local and remote.

### Agent Registry

**File:** `packages/core/src/agents/registry.ts`

- `AgentRegistry` — Tracks all registered agents (local and remote)
- `acknowledgeAgent()` — Acknowledges newly discovered agents using metadata hash tracking
- `reload()` — Runtime registry reload with A2A client cache clearing
- `getDiscoveredDefinition()` / `getAllDiscoveredAgentNames()` — Tracks all agents including disabled/unacknowledged
- `addAgentPolicy()` — Dynamically registers security policies for agents (ALLOW for local, ASK_USER for remote)
- Remote agent loading via AgentCard URL resolution
- Per-agent model config registration with "inherit" resolution mechanism

### Local Agent Executor

**File:** `packages/core/src/agents/local-executor.ts`

`LocalAgentExecutor<TOutput>` — Strongly-typed agent executor with Zod schema validation:
- Dynamic tool registry isolation per agent (prevents subagent tool recursion)
- MCP tool namespace validation (requires `serverName::toolName` format)
- `complete_task` tool generation with structured output validation
- Thought chunking and activity event callbacks for UI streaming
- Chat compression service integration for long agent conversations
- Grace period (1 min) after task completion for graceful shutdown
- Template string interpolation for system prompt and query parameters

**Termination modes:** `ERROR`, `TIMEOUT`, `GOAL`, `MAX_TURNS`, `ABORTED`, `ERROR_NO_COMPLETE_TASK_CALL`

### A2A (Agent-to-Agent) Remote Agents

**File:** `packages/core/src/agents/a2a-client-manager.ts`

- Singleton client factory managing multiple remote agents
- `loadAgent()` — Fetches AgentCard from URL with optional OAuth auth handler
- Transport layers: `RestTransportFactory`, `JsonRpcTransportFactory`
- Caches loaded agents and metadata for repeated use
- Handles authentication-protected remote agents (e.g., Vertex AI)

**File:** `packages/core/src/agents/a2aUtils.ts`

- `extractMessageText()`, `extractTaskText()` — Human-readable message extraction from A2A protocol
- `extractIdsFromResponse()` — Context and task ID persistence across A2A interactions
- Task state handling: completed, failed, canceled, input-required transitions

### Agent Authentication

**File:** `packages/core/src/agents/auth-provider/factory.ts`

- Dynamic auth provider instantiation based on A2A AuthConfig
- Multiple auth strategies: OAuth, Service Account Impersonation, ADC
- `ADCHandler` — Application Default Credentials for secure platform integration

### Built-in Agents

| Agent | File | Purpose |
|-------|------|---------|
| `codebase_investigator` | `agents/codebase-investigator.ts` | Complex refactoring and system-wide analysis |
| `cli_help` | `agents/cli-help-agent.ts` | CLI help and guidance |
| `generalist` | `agents/generalist-agent.ts` | General-purpose task execution |

Each has dedicated system prompts, model configs, and pre-configured tool sets.

### Agent Scheduler

**File:** `packages/core/src/agents/agent-scheduler.ts`

- `scheduleAgentTools()` — Dedicated scheduler for agent tool execution
- Config proxy creation for agent-specific tool registry injection
- Parent call ID tracking for nested agent invocations

---

## 18. Skills System

### Skill Manager

**File:** `packages/core/src/skills/skillManager.ts`

- `discoverSkills()` — Multi-source skill discovery with precedence ordering:
  ```
  Built-in < Extensions < User < User Agent Skills < Workspace < Project Agent Skills
  ```
- Built-in skills auto-loaded from `skills/builtin/` directory
- `setDisabledSkills()` — Case-insensitive skill disabling by name
- Admin skill enable/disable state tracking
- Skill conflict detection and warning emission

### Skill Loader

**File:** `packages/core/src/skills/skillLoader.ts`

- Reads `.skill` markdown files with YAML frontmatter metadata
- Parses: name, description, disabled flag
- Caches skill definitions for performance
- Lazy skill discovery in user/workspace/project directories

---

## 19. MCP System (Model Context Protocol)

### MCP Client Manager

**File:** `packages/core/src/mcp/` (12+ files)

Manages connections to external MCP servers providing tools, resources, and prompts.

### OAuth System

**File:** `packages/core/src/mcp/oauth-provider.ts`

Full OAuth 2.0 implementation:
- Authorization code flow with PKCE support
- Token refresh and expiration handling
- Scope management
- Multiple auth methods
- Token storage integration

**File:** `packages/core/src/mcp/oauth-utils.ts`

- OAuth server metadata parsing
- Authorization server discovery
- Protected resource metadata

### Token Storage

**File:** `packages/core/src/mcp/token-storage/` (12+ files)

Hybrid storage with automatic fallback:

```
HybridTokenStorage
  ├─ Try: KeychainTokenStorage (macOS/Windows keychain)
  └─ Fallback: FileTokenStorage (encrypted file-based)

Override: GEMINI_FORCE_FILE_STORAGE env var
```

- Lazy initialization with race condition prevention
- Multiple storage backends abstracted behind `BaseTokenStorage` interface

### Service Account Impersonation

**File:** `packages/core/src/mcp/sa-impersonation-provider.ts`

- Generates identity federation credentials for secure MCP access
- Subject token generation and exchange flow

### Resource Registry

**File:** `packages/core/src/resources/resource-registry.ts`

- `ResourceRegistry` — Centralized MCP resource tracking
- `setResourcesForServer()` — Updates resources per MCP server
- `findResourceByUri()` — Lookup by `serverName:uri` format
- Per-server resource management with cleanup and timestamps

---

## 20. Code Assist & Admin Controls

### Enterprise Admin Controls

**File:** `packages/core/src/code_assist/admin/admin_controls.ts`

- `fetchAdminControls()` — Polls admin server for enterprise feature flags and MCP config
- Polling interval: 5 minutes after initial fetch
- `sanitizeAdminSettings()` — Validates and normalizes admin response schemas
- Features controlled:
  - Strict/Secure mode toggling
  - MCP enable/disable with server-specific include/exclude tool lists
  - CLI feature settings (extensions, unmanaged capabilities)
  - Legacy "secureModeEnabled" backward compatibility
- Non-enterprise users receive 403 (gracefully handled)

### Experiments / Feature Flags

**File:** `packages/core/src/code_assist/experiments/`

- `experiments.ts` — Feature flag evaluation
- `client_metadata.ts` — Client metadata for experiment targeting
- `flagNames.ts` — Centralized feature flag name constants

---

## 21. Availability System

### Model Availability Service

**File:** `packages/core/src/availability/modelAvailabilityService.ts`

Tracks model health and manages fallback selection:

- `markTerminal()` — Marks model unavailable (permanent within session, e.g., quota/capacity)
- `markRetryOncePerTurn()` — Transient failure (consumed once per turn)
- `consumeStickyAttempt()` — Tracks whether sticky attempt was used
- `selectFirstAvailable()` — Round-robin fallback through healthy models
- `resetTurn()` — Resets sticky retry consumption at turn boundary
- Two unavailability types: **terminal** (quota/capacity) and **transient** (retry_once_per_turn)

### Policy Chains

**File:** `packages/core/src/availability/policyHelpers.ts`

- `resolvePolicyChain()` — Ordered fallback chain based on model selection
- Support for auto models with preview variants
- Flash Lite-specific policy chains
- `buildFallbackPolicyContext()` — Extracts candidates after failed model
- `applyAvailabilityTransition()` — State machine for marking models

**File:** `packages/core/src/availability/policyCatalog.ts`

- Predefined model policy chains for different tiers
- User tier-based policy selection

---

## 22. Safety System

**File:** `packages/core/src/safety/`

### Checker Runner

**File:** `packages/core/src/safety/checker-runner.ts`

- `CheckerRunner` — Executes safety checkers (in-process and external)
- Timeout: default 5 seconds per check
- Spawns external checker processes via stdin/stdout serialization
- Validates results against `SafetyCheckDecision` schema

### Checker Registry

**File:** `packages/core/src/safety/registry.ts`

- `CheckerRegistry` — Resolves checker names to implementations
- Built-in: `AllowedPathChecker` — Validates tool calls against allowed path patterns
- Extensible to external checkers via file path resolution
- Name validation: lowercase alphanumeric + hyphens only

### Context Builder

**File:** `packages/core/src/safety/context-builder.ts`

- Builds context objects for checkers based on tool call and policy state

---

## 23. Confirmation Bus (Message Bus)

**File:** `packages/core/src/confirmation-bus/message-bus.ts`

Event bus with policy-integrated tool confirmation:

- `publish()` — Event publishing with policy checking for tool confirmations
- `subscribe()` / `unsubscribe()` — Event listener management
- `request()` — Request-response pattern with correlation IDs and timeouts (default 60s)
- Three response types: `ALLOW`, `DENY`, `ASK_USER` based on PolicyEngine decisions
- `MessageBusType` enum: `TOOL_CONFIRMATION_REQUEST`, `TOOL_CONFIRMATION_RESPONSE`, `TOOL_POLICY_REJECTION`

---

## 24. IDE Integration

**File:** `packages/core/src/ide/`

### IDE Client

**File:** `packages/core/src/ide/ide-client.ts`

- Singleton pattern with async initialization
- Two transports: `StreamableHTTPClientTransport`, `StdioClientTransport`
- IDE process detection and connection config file reading
- Diff view mutex (prevents simultaneous multiple diffs)
- Status listeners for connection state changes
- Trust change listeners
- Proxy-aware fetch for corporate environments

### IDE Detection

**File:** `packages/core/src/ide/detect-ide.ts`

- `IDE_DEFINITIONS` — Catalog of supported IDEs with detection logic
- IDE type detection via process inspection

### IDE Context Store

**File:** `packages/core/src/ide/ideContext.ts`

- Stores current IDE state (open files, active file, cursor, selections)
- Context delta calculation for efficient updates

### IDE Extension Installation

**File:** `packages/core/src/ide/ide-installer.ts`

- Manages IDE extension installation and updates

---

## 25. Hook System (Extended)

**File:** `packages/core/src/hooks/` (7+ files)

Beyond the 6 hook points documented, the hook system is a full framework:

| Component | File | Purpose |
|-----------|------|---------|
| `HookSystem` | `hookSystem.ts` | Orchestrates discovery, registration, planning, execution |
| `HookRegistry` | `hookRegistry.ts` | Registers hooks from multiple sources with precedence |
| `HookRunner` | `hookRunner.ts` | Executes hooks sequentially or in parallel |
| `HookAggregator` | `hookAggregator.ts` | Combines results from multiple hooks |
| `HookEventHandler` | `hookEventHandler.ts` | Maps events to hook triggers |
| `HookPlanner` | `hookPlanner.ts` | Plans hook execution order based on event |
| `HookTranslator` | `hookTranslator.ts` | Converts between hook formats |

**Hook precedence:** Trusted system → User → Extension

---

## 26. Telemetry System

**File:** `packages/core/src/telemetry/` (45+ files)

Comprehensive observability infrastructure:

| Component | Purpose |
|-----------|---------|
| `loggers.ts` | 20+ typed event logging functions |
| `metrics.ts` | Performance and usage metrics collection |
| `activity-monitor.ts` | User activity pattern tracking |
| `memory-monitor.ts` | Memory usage tracking and alerts |
| `startupProfiler.ts` | Startup performance profiling |
| `semantic.ts` | Semantic event routing |
| `rate-limiter.ts` | Telemetry rate limiting |
| `sanitize.ts` | PII sanitization before logging |
| `gcp-exporters.ts` | Google Cloud Platform exporters |
| `sdk.ts` | SDK initialization and configuration |
| `uiTelemetry.ts` | UI-specific event tracking |
| `clearcut-logger/` | Clearcut logging integration |

---

## 27. BaseLlmClient (Utility LLM Calls)

**File:** `packages/core/src/core/baseLlmClient.ts`

Used for infrastructure tasks (NOT user conversations):

```typescript
class BaseLlmClient {
  generateJson<T>(schema, prompt, modelAlias) → T
    // Calls model for structured JSON output with Zod schema validation

  generateContent(contents, systemInstruction, modelAlias) → GenerateContentResponse
    // Basic content generation for internal use

  countTokens(parts, model) → number
    // Token counting via API

  embedContent(content, model) → EmbeddingVector
    // Embedding generation
}
```

Used by: Loop detection, next speaker checker, session summaries, model routing classifiers.

---

## 28. Shell Execution Service

**File:** `packages/core/src/services/shellExecutionService.ts`

Advanced shell command execution:
- PTY (pseudo-terminal) handling
- Signal management (SIGINT, SIGTERM)
- Stream collection and serialization
- Inactivity timeout handling
- Working directory tracking
- Environment variable management
- Binary stream detection
- Background process support

---

## 29. Session Summary Service

**File:** `packages/core/src/services/sessionSummaryService.ts`

- One-line session summary focused on user intent
- Uses Gemini Flash Lite (fast, efficient)
- Sliding window message selection (first N + last N)
- Filters to user/gemini messages only
- 5-second timeout for reliability

---

## 30. Content Generator Variants

### LoggingContentGenerator

**File:** `packages/core/src/core/loggingContentGenerator.ts`

Wraps ContentGenerator with request/response logging for telemetry.

### RecordingContentGenerator

**File:** `packages/core/src/core/recordingContentGenerator.ts`

Records API responses for replay. Used in testing with pre-recorded responses.

### FakeContentGenerator

**File:** `packages/core/src/core/fakeContentGenerator.ts`

Replays recorded responses for deterministic testing.

---

## 31. Core Event System

**File:** `packages/core/src/utils/events.ts`

Central event emitter with typed events:

| Category | Events |
|----------|--------|
| **Auth** | `ConsentRequest` |
| **Model** | `ModelChanged`, `RetryAttempt` |
| **Console** | `ConsoleLog`, `Output` |
| **Memory** | `MemoryChanged` |
| **Hooks** | `HookStart`, `HookEnd` |
| **Agents** | `AgentsDiscovered`, `AgentsRefreshed` |
| **Extensions** | `ExtensionEvents` |
| **MCP** | `MCPClientConnected`, `MCPClientDisconnected` |
| **IDE** | `IdeStatusChanged`, `IdeTrustChanged` |

---

## 32. CLI Commands

**File:** `packages/core/src/commands/`

| Command | File | Purpose |
|---------|------|---------|
| `init` | `commands/init.ts` | Initialize Gemini CLI config in project |
| `memory` | `commands/memory.ts` | Read/write GEMINI.md memory files |
| `restore` | `commands/restore.ts` | Restore previous chat session |
| `extensions` | `commands/extensions.ts` | Manage CLI extensions |

---

## 33. Workspace Context

**File:** `packages/core/src/utils/workspaceContext.ts`

- `WorkspaceContext` — Tracks multiple workspace directories
- Directory validation and resolution
- Change notifications via listener subscription
- Support for additional directories beyond main project root (via `/dir add`)

---

## 34. Credential Storage

**File:** `packages/core/src/core/apiKeyCredentialStorage.ts`

- `loadApiKey()` / `saveApiKey()` / `clearApiKey()`
- Uses `HybridTokenStorage` for secure persistence (keychain with file fallback)

---

## 35. Key Utilities Not Previously Covered

| Utility | File | Purpose |
|---------|------|---------|
| **File Search** | `utils/filesearch/fileSearch.ts` | Fuzzy file search with result caching, picomatch patterns |
| **BFS File Search** | `utils/bfsFileSearch.ts` | Breadth-first file search alternative |
| **Auth Consent** | `utils/authConsent.ts` | OAuth consent flow (interactive + non-interactive) |
| **Browser Launch** | `utils/browser.ts` | CI/SSH/headless detection for browser-based flows |
| **Schema Validator** | `utils/schemaValidator.ts` | JSON Schema validation for tool params |
| **Edit Corrector** | `utils/editCorrector.ts` | Fixes incorrect edit operations, content diff |
| **Summarizer** | `utils/summarizer.ts` | Content summarization for history/documents |
| **Thought Utils** | `utils/thoughtUtils.ts` | Parses thinking tags from model output |
| **Terminal Serializer** | `utils/terminalSerializer.ts` | ANSI color code handling |
| **Env Sanitization** | `services/environmentSanitization.ts` | Filters sensitive env vars for shell |
| **Safe JSON** | `utils/safeJsonStringify.ts` | Handles circular references |
| **Checkpoint** | `utils/checkpointUtils.ts` | Session checkpoint save/restore |
| **Prompt ID Context** | `utils/promptIdContext.ts` | Async-local prompt ID tracing |
| **Tool Call Context** | `utils/toolCallContext.ts` | Async-local tool call context |
| **Extension Loader** | `utils/extensionLoader.ts` | Dynamic extension discovery and loading |
| **Exit Codes** | `utils/exitCodes.ts` | Standardized exit codes |
| **Debug Logger** | `utils/debugLogger.ts` | Structured debug logging with env var control |
