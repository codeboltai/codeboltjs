# Gemini CLI to Codebolt Agent SDK — Architecture Mapping

> **Purpose:** Map every major Gemini CLI component to its Codebolt SDK equivalent, identify which SDK level to use, and highlight gaps requiring custom implementation.

---

## 1. High-Level Architecture Comparison

### Gemini CLI Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  CLI Shell (Ink/React UI)                                      │
│  └─ GeminiClient (orchestrator)                                │
│      ├─ PromptProvider → snippets.ts (system prompt)           │
│      ├─ environmentContext.ts (initial history)                 │
│      ├─ GeminiChat (API layer)                                 │
│      │   └─ ContentGenerator (GoogleGenAI SDK)                 │
│      ├─ Turn (single turn executor)                            │
│      ├─ CoreToolScheduler (tool state machine)                 │
│      │   └─ ToolExecutor → executeToolWithHooks()              │
│      ├─ ToolRegistry (built-in + MCP + discovered)             │
│      ├─ PolicyEngine (ALLOW/DENY/ASK_USER)                     │
│      ├─ ChatCompressionService (history summarization)         │
│      ├─ LoopDetectionService (3 methods)                       │
│      ├─ ModelRouterService (auto routing)                      │
│      ├─ HookSystem (6 hook points)                             │
│      ├─ ChatRecordingService (session persistence)             │
│      └─ NextSpeakerChecker (continuation detection)            │
└────────────────────────────────────────────────────────────────┘
```

### Codebolt Agent Architecture (Target)

```
┌────────────────────────────────────────────────────────────────┐
│  Codebolt Application (UI, permissions, tool approval)         │
│  └─ Agent Entry Point (src/index.ts)                           │
│      ├─ InitialPromptGenerator (system prompt + context)       │
│      │   ├─ CoreSystemPromptModifier                           │
│      │   ├─ ChatHistoryMessageModifier                         │
│      │   ├─ EnvironmentContextModifier                         │
│      │   ├─ DirectoryContextModifier                           │
│      │   ├─ IdeContextModifier                                 │
│      │   ├─ ToolInjectionModifier                              │
│      │   ├─ AtFileProcessorModifier                            │
│      │   └─ [Custom Modifiers for Gemini-specific features]    │
│      ├─ AgentStep (LLM call with pre/post processors)          │
│      │   ├─ ChatCompressionModifier (pre-inference)            │
│      │   └─ [Custom LoopDetectionProcessor]                    │
│      ├─ ResponseExecutor (tool execution)                      │
│      │   ├─ Built-in MCP tool routing                          │
│      │   └─ ConversationCompactorModifier (post-tool)          │
│      └─ codebolt.* APIs (fs, terminal, llm, chat, mcp, etc.)  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Component-by-Component Mapping

### 2.1 Core Orchestration

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `GeminiClient` | `InitialPromptGenerator` + `AgentStep` + `ResponseExecutor` loop | Level 2 (Base Components) | The main agent loop. Gemini's client is ~1060 lines; Codebolt's Level 2 composes these three into an equivalent loop. |
| `GeminiClient.sendMessageStream()` | `codebolt.onMessage()` handler with loop | Level 2 | Entry point for user messages |
| `GeminiClient.processTurn()` | `AgentStep.executeStep()` + `ResponseExecutor.executeResponse()` | Level 2 | Single turn = LLM call + tool execution |
| `GeminiClient.startChat()` | `InitialPromptGenerator.processMessage()` | Level 2 | Initial prompt assembly |

### 2.2 Prompt System

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `PromptProvider.getCoreSystemPrompt()` | `CoreSystemPromptModifier` | Level 2 | Custom system prompt via `customSystemPrompt` parameter |
| `snippets.ts` (15 render functions, ~40KB) | Custom `BaseMessageModifier` subclass | Level 2 | Must port Gemini's prompt sections as a custom modifier |
| `environmentContext.ts` | `EnvironmentContextModifier` | Level 2 (built-in) | Date, OS, env context — already built-in |
| `getDirectoryContextString()` | `DirectoryContextModifier` | Level 2 (built-in) | Folder tree injection — already built-in |
| `getInitialChatHistory()` | `ChatHistoryMessageModifier` | Level 2 (built-in) | Conversation history — already built-in |
| IDE context injection | `IdeContextModifier` | Level 2 (built-in) | Active file, cursor, open files — already built-in |
| `@file` processing | `AtFileProcessorModifier` | Level 2 (built-in) | File mention resolution — already built-in |
| User memory (GEMINI.md) | Custom `BaseMessageModifier` | Level 2 | Need custom modifier to inject persistent memory |
| Tool declarations | `ToolInjectionModifier` | Level 2 (built-in) | Tool schema injection — already built-in |
| Template substitution engine | N/A (not needed) | — | Codebolt handles tool injection natively |

### 2.3 Tool System

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `ToolRegistry` | Codebolt MCP tool system | Level 2 | `ToolInjectionModifier` handles tool listing; `ResponseExecutor` handles routing |
| `CoreToolScheduler` (state machine) | `ResponseExecutor` (built-in) | Level 2 | Codebolt handles tool scheduling internally |
| `ToolExecutor` | `ResponseExecutor` (built-in) | Level 2 | Automatic MCP tool execution via `codebolt--` prefix routing |
| `PolicyEngine` (ALLOW/DENY/ASK_USER) | **Codebolt Application** (handled externally) | N/A | Permissions handled by platform, not agent code |
| `executeToolWithHooks()` | `PreToolCallProcessor` + `PostToolCallProcessor` | Level 2 | Custom processors for before/after tool execution |
| Built-in tools (read_file, shell, etc.) | Codebolt MCP tools (`codebolt--readFile`, etc.) | Level 2 | Already available as MCP tools |
| MCP tools (external) | `codebolt.mcp.executeTool()` | Level 1/2 | MCP integration built into Codebolt |
| Tool confirmation/approval | **Codebolt Application** | N/A | Platform handles all approval UI |

### 2.4 History & Compression

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `ChatCompressionService` | `ChatCompressionModifier` (pre-inference) + `ConversationCompactorModifier` (post-tool) | Level 2 (built-in) | Token-based compression with configurable threshold |
| Dual history (comprehensive + curated) | Managed internally by `AgentStep` | Level 2 | History management built into the framework |
| Compression prompt (XML state_snapshot) | `ConversationCompactorModifier` with `compactStrategy: 'smart'` | Level 2 | Built-in smart compaction |
| Token estimation | Handled by Codebolt framework | Level 2 | Automatic token tracking |

### 2.5 Safety & Resilience

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `LoopDetectionService` (3 methods) | Custom `BasePreInferenceProcessor` | Level 2 | **GAP**: Must implement loop detection as custom processor |
| `retryWithBackoff()` | Handled by Codebolt LLM layer | Level 1 | Basic retry built-in; advanced retry needs custom code |
| `NextSpeakerChecker` | Custom logic in agent loop | Level 2 | **GAP**: Must implement continuation detection |
| Model routing (auto/pro/flash) | `codebolt.llm.inference()` with model selection | Level 1 | **GAP**: Auto-routing must be custom-built |
| Session recording/resumption | `codebolt.state` / `codebolt.memory` | Level 1 | Can use state persistence APIs |

### 2.6 Extensibility

| Gemini CLI Component | Codebolt Equivalent | SDK Level | Notes |
|---------------------|---------------------|-----------|-------|
| `HookSystem` (6 hook points) | `PreInferenceProcessor` / `PostInferenceProcessor` / `PreToolCallProcessor` / `PostToolCallProcessor` | Level 2 | Codebolt processors map cleanly to Gemini hooks |
| Skills system | Codebolt Skills (`.skill` files) | Platform | Both platforms have skill systems |
| Agent registry (sub-agents) | `codebolt.agent.startAgent()` / `codebolt.thread` | Level 1 | Sub-agent orchestration available |
| Agent-to-Agent (A2A) | `codebolt.agent.startAgent()` | Level 1 | Local agent spawning |

---

## 3. Recommended SDK Level: Level 2 (Base Components)

The Gemini CLI is a **highly customized agentic loop** with:
- Custom prompt composition (15 render functions)
- 3-method loop detection
- Sequential tool scheduling with state machine
- Next-speaker continuation logic
- Model routing strategies
- Hook system at 6 points

**Level 3 (CodeboltAgent wrapper)** is too simple — it doesn't allow customizing the loop internals.

**Level 1 (Core API)** is too low-level — we'd reimplement what Level 2 already provides.

**Level 2 (Base Components)** is the sweet spot:
- `InitialPromptGenerator` with custom modifiers replaces the entire prompt pipeline
- `AgentStep` with pre/post inference processors replaces the turn executor
- `ResponseExecutor` with pre/post tool call processors replaces the tool scheduler
- The agentic loop structure matches Gemini's `processTurn()` recursive pattern

---

## 4. What Codebolt Provides Out-of-the-Box

These Gemini CLI features are **already handled by Codebolt** with zero custom code:

| Feature | Codebolt Component |
|---------|-------------------|
| Chat history management | `ChatHistoryMessageModifier` |
| Environment context (date, OS) | `EnvironmentContextModifier` |
| Directory tree context | `DirectoryContextModifier` |
| IDE integration (active file, cursor) | `IdeContextModifier` |
| Tool declaration injection | `ToolInjectionModifier` |
| @file mention processing | `AtFileProcessorModifier` |
| Tool execution routing (MCP) | `ResponseExecutor` built-in routing |
| Permission/approval UI | Codebolt Application |
| File operations (read, write, edit) | `codebolt--readFile`, `codebolt--writeFile`, etc. |
| Shell command execution | `codebolt--executeCommand` |
| Git operations | `codebolt--git*` tools |
| Web search/fetch | `codebolt--webSearch`, `codebolt--webFetch` (if available) |
| Chat compression | `ChatCompressionModifier` + `ConversationCompactorModifier` |
| Sub-agent spawning | `codebolt.agent.startAgent()` |

---

## 5. What Requires Custom Implementation

These Gemini CLI features have **no direct Codebolt equivalent** and must be built as custom processors/modifiers:

| Gemini Feature | Custom Implementation Required | Priority |
|---------------|-------------------------------|----------|
| **Gemini-style system prompt** (15 sections, ~40KB) | `GeminiSystemPromptModifier extends BaseMessageModifier` | HIGH |
| **Loop detection** (tool call + content chunk + LLM-based) | `LoopDetectionProcessor extends BasePreInferenceProcessor` | HIGH |
| **Next speaker checker** | Logic in agent loop after turn completion | MEDIUM |
| **Model routing** (auto → pro/flash classification) | Custom routing logic before `AgentStep.executeStep()` | MEDIUM |
| **User memory** (GEMINI.md equivalent) | `MemoryModifier extends BaseMessageModifier` using `codebolt.memory` | MEDIUM |
| **Session recording** | `SessionRecordingProcessor extends BasePostToolCallProcessor` | LOW |
| **Retry with backoff** (429, 5xx handling) | Wrapper around `AgentStep.executeStep()` | LOW |
| **Hook system** (external extensibility) | Design pattern using processors | LOW |
| **Sandbox awareness** | Conditional system prompt section | LOW |
| **Plan mode** (read-only tools) | `allowedTools` filtering + custom system prompt section | LOW |

---

## 6. Architectural Decision Summary

```
┌──────────────────────────────────────────────────────────────┐
│  DECISION: Use Level 2 (Base Components) as the primary      │
│  framework, with Level 1 (Core API) for specific features    │
│  like memory persistence and sub-agent orchestration.         │
│                                                              │
│  STRUCTURE:                                                   │
│  ├─ InitialPromptGenerator                                   │
│  │   ├─ ChatHistoryMessageModifier (built-in)                │
│  │   ├─ EnvironmentContextModifier (built-in)                │
│  │   ├─ DirectoryContextModifier (built-in)                  │
│  │   ├─ IdeContextModifier (built-in)                        │
│  │   ├─ GeminiSystemPromptModifier (CUSTOM)                  │
│  │   ├─ MemoryModifier (CUSTOM)                              │
│  │   ├─ ToolInjectionModifier (built-in)                     │
│  │   └─ AtFileProcessorModifier (built-in)                   │
│  │                                                            │
│  ├─ AgentStep                                                │
│  │   ├─ PreInference:                                        │
│  │   │   ├─ ChatCompressionModifier (built-in)               │
│  │   │   └─ LoopDetectionProcessor (CUSTOM)                  │
│  │   └─ PostInference: (none needed initially)               │
│  │                                                            │
│  ├─ ResponseExecutor                                         │
│  │   ├─ PreToolCall: (none needed — Codebolt handles)        │
│  │   └─ PostToolCall:                                        │
│  │       └─ ConversationCompactorModifier (built-in)         │
│  │                                                            │
│  └─ Custom Loop Logic:                                       │
│      ├─ NextSpeakerChecker (after each turn)                 │
│      ├─ ModelRouting (before each AgentStep)                  │
│      └─ MaxTurns limiter                                     │
└──────────────────────────────────────────────────────────────┘
```
