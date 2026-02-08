# Gemini CLI Prompt System → Codebolt Prompt System Mapping

> **Purpose:** Map the Gemini CLI's 4-stage prompt construction pipeline (environment context, system instruction, tool declarations, chat session) to Codebolt's modifier-based prompt system.

---

## 1. Gemini CLI Prompt Pipeline (4 Stages)

```
Stage A: Environment Context → Initial Chat History
  getInitialChatHistory() → Content[0] = { role: 'user', text: setupMessage }

Stage B: System Instruction
  getCoreSystemPrompt() → PromptProvider → snippets.ts (15 sections, ~40KB)

Stage C: Tool Declarations
  toolRegistry.getFunctionDeclarations() → OpenAPI schemas

Stage D: Chat Session Assembly
  new GeminiChat(systemInstruction, tools, history)
```

## 2. Codebolt Modifier Pipeline (Equivalent)

```
InitialPromptGenerator.processMessage(reqMessage)
  → Modifier 1: ChatHistoryMessageModifier     → Stage A (history)
  → Modifier 2: EnvironmentContextModifier      → Stage A (env context)
  → Modifier 3: DirectoryContextModifier        → Stage A (folder tree)
  → Modifier 4: IdeContextModifier              → Stage A (IDE state)
  → Modifier 5: CoreSystemPromptModifier        → Stage B (system prompt)
  → Modifier 6: GeminiMemoryModifier [CUSTOM]   → Stage B (user memory)
  → Modifier 7: ToolInjectionModifier           → Stage C (tools)
  → Modifier 8: AtFileProcessorModifier         → Additional
  → Returns: ProcessedMessage (ready for LLM)
```

---

## 3. Stage A: Environment Context → Codebolt Modifiers

### Gemini CLI Implementation

The first message in chat history is an environment setup message:

```
This is the Gemini CLI. We are setting up the context for our chat.
Today's date is Thursday, February 5, 2026.
My operating system is: darwin
The project's temporary directory is: /tmp/.gemini/<hash>/
I'm currently working in the directory: /Users/user/project
Here is the folder structure of the current working directories:
<folder tree>
<environment memory from GEMINI.md>
Reminder: Do not return an empty response when a tool call is required.
My setup is complete. I will provide my first command in the next turn.
```

### Codebolt Equivalent: Built-in Modifiers

| Gemini Context Element | Codebolt Modifier | Coverage |
|----------------------|-------------------|----------|
| Date/time | `EnvironmentContextModifier` | Built-in: includes current date |
| Operating system | `EnvironmentContextModifier` | Built-in: includes OS info |
| Working directory | `EnvironmentContextModifier` | Built-in: includes CWD |
| Folder tree | `DirectoryContextModifier` | Built-in: generates folder structure |
| IDE state (active file, cursor) | `IdeContextModifier` | Built-in: full IDE context |
| Environment memory (GEMINI.md) | **Custom modifier needed** | See GeminiMemoryModifier below |
| Project temp dir | N/A (not critical) | Can add to custom modifier if needed |

**Built-in Coverage: ~80%.** Only user memory needs a custom modifier.

---

## 4. Stage B: System Instruction → CoreSystemPromptModifier + Custom

### Gemini CLI: 15 Prompt Sections

The Gemini CLI composes its system instruction from 15 render functions in `snippets.ts`:

| # | Section | Function | ~Size | Codebolt Mapping |
|---|---------|----------|-------|-----------------|
| 1 | Preamble | `renderPreamble()` | ~200 chars | Part of `customSystemPrompt` |
| 2 | Core Mandates | `renderCoreMandates()` | ~3KB | Part of `customSystemPrompt` |
| 3 | Agent Contexts | `renderAgentContexts()` | Variable | Sub-agent list (if needed) |
| 4 | Agent Skills | `renderAgentSkills()` | Variable | Skills list (if using skills) |
| 5 | Hook Context | `renderHookContext()` | ~100 chars | N/A (hooks injected differently) |
| 6a | Primary Workflows | `renderPrimaryWorkflows()` | ~5KB | Part of `customSystemPrompt` |
| 6b | Planning Workflow | `renderPlanningWorkflow()` | ~3KB | Conditional section |
| 7 | Operational Guidelines | `renderOperationalGuidelines()` | ~3KB | Part of `customSystemPrompt` |
| 8 | Sandbox | `renderSandbox()` | ~300 chars | Conditional section |
| 9 | Git Repo | `renderGitRepo()` | ~1KB | Part of `customSystemPrompt` |
| 10 | Final Reminder | `renderFinalReminder()` | ~300 chars | Part of `customSystemPrompt` |
| 11 | User Memory | `renderFinalShell()` + `renderUserMemory()` | Variable | Custom modifier |
| 12 | Compression Prompt | `getCompressionPrompt()` | ~2KB | Built into `ConversationCompactorModifier` |

### Codebolt: CoreSystemPromptModifier with Full Gemini Prompt

The entire Gemini system prompt (~40KB across 15 sections) should be ported as a single `customSystemPrompt` string, adapted for Codebolt's tool naming conventions.

```typescript
const geminiSystemPrompt = buildGeminiSystemPrompt({
  interactive: true,
  hasSkills: false,
  enableCodebaseInvestigator: false,
  enableWriteTodosTool: false,
  sandbox: 'outside',
  isGitRepo: true,
  isPlanMode: false
});

const promptGenerator = new InitialPromptGenerator({
  processors: [
    // ... other modifiers ...
    new CoreSystemPromptModifier({ customSystemPrompt: geminiSystemPrompt }),
    // ... more modifiers ...
  ],
  baseSystemPrompt: geminiSystemPrompt
});
```

### Prompt Adaptation Requirements

The Gemini system prompt references tool names like `read_file`, `shell`, `edit`, `grep`, `glob`. In Codebolt, tool names follow the `toolbox--toolname` pattern. The prompt must be adapted:

| Gemini Tool Reference | Codebolt Equivalent |
|----------------------|---------------------|
| `read_file` | `codebolt--readFile` |
| `write_file` | `codebolt--writeFile` |
| `edit` | `codebolt--editFile` (or similar) |
| `shell` | `codebolt--executeCommand` |
| `grep` | `codebolt--searchFiles` |
| `glob` | `codebolt--listFiles` |
| `ls` | `codebolt--listFiles` |
| `web_fetch` | `codebolt--webFetch` (if available) |
| `web_search` | `codebolt--webSearch` (if available) |
| `memory` | Custom via `codebolt.memory` APIs |
| `attempt_completion` | Built-in completion detection |

### buildGeminiSystemPrompt() Function Design

```typescript
interface GeminiPromptOptions {
  interactive: boolean;
  hasSkills: boolean;
  enableCodebaseInvestigator: boolean;
  enableWriteTodosTool: boolean;
  sandbox: 'macos-seatbelt' | 'generic' | 'outside';
  isGitRepo: boolean;
  isPlanMode: boolean;
  readFileToolName: string;
  shellToolName: string;
  editToolName: string;
  grepToolName: string;
  globToolName: string;
}

function buildGeminiSystemPrompt(options: GeminiPromptOptions): string {
  const sections: string[] = [];

  // 1. Preamble
  sections.push(renderPreamble(options.interactive));

  // 2. Core Mandates
  sections.push(renderCoreMandates(options));

  // 3. Agent Contexts (if sub-agents configured)
  // sections.push(renderAgentContexts(...));

  // 4-5. Skills + Hooks (platform-managed in Codebolt)

  // 6. Workflows (primary or planning)
  if (options.isPlanMode) {
    sections.push(renderPlanningWorkflow(options));
  } else {
    sections.push(renderPrimaryWorkflows(options));
  }

  // 7. Operational Guidelines
  sections.push(renderOperationalGuidelines(options));

  // 8. Sandbox
  if (options.sandbox !== 'outside') {
    sections.push(renderSandbox(options.sandbox));
  }

  // 9. Git Repo
  if (options.isGitRepo) {
    sections.push(renderGitRepo(options.interactive));
  }

  // 10. Final Reminder
  sections.push(renderFinalReminder(options.readFileToolName));

  return sections.filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n');
}
```

---

## 5. Stage C: Tool Declarations → ToolInjectionModifier

### Gemini CLI

```typescript
const toolDeclarations = toolRegistry.getFunctionDeclarations();
const tools: Tool[] = [{ functionDeclarations: toolDeclarations }];
// Passed as GenerateContentConfig.tools to the API
```

### Codebolt Equivalent

```typescript
new ToolInjectionModifier({
  includeToolDescriptions: true,
  // Optional: restrict to specific tools
  allowedTools: [
    'codebolt--readFile',
    'codebolt--writeFile',
    'codebolt--editFile',
    'codebolt--executeCommand',
    'codebolt--listFiles',
    'codebolt--searchFiles',
    'codebolt--git_status',
    'codebolt--git_diff',
    'codebolt--git_commit'
    // ... add more as needed
  ]
})
```

The `ToolInjectionModifier` automatically:
1. Fetches available MCP tool schemas from connected servers
2. Filters by `allowedTools` if specified
3. Injects tool descriptions into the prompt
4. Handles tool declaration format for the LLM

---

## 6. Custom Modifiers Required

### 6.1 GeminiMemoryModifier

Equivalent to Gemini's `GEMINI.md` user/project memory system.

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import { ProcessedMessage } from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';

class GeminiMemoryModifier extends BaseMessageModifier {
  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Load user memory (equivalent to ~/.gemini/GEMINI.md)
    const userMemory = await codebolt.memory.json.load('user_memory');

    // Load project memory (equivalent to <project>/GEMINI.md)
    const projectMemory = await codebolt.memory.json.load('project_memory');

    if (userMemory || projectMemory) {
      let memoryContent = '\n---\n\n';
      if (userMemory) {
        memoryContent += `# User Preferences\n${JSON.stringify(userMemory, null, 2)}\n\n`;
      }
      if (projectMemory) {
        memoryContent += `# Project Context\n${JSON.stringify(projectMemory, null, 2)}\n\n`;
      }

      // Append to system prompt (like renderFinalShell in Gemini)
      createdMessage.message.messages.push({
        role: 'system',
        content: memoryContent
      });
    }

    return createdMessage;
  }
}
```

### 6.2 PlanModeModifier (Conditional)

When in plan mode, restricts tools and changes workflow section.

```typescript
class PlanModeModifier extends BaseMessageModifier {
  private isPlanMode: boolean;

  constructor(isPlanMode: boolean) {
    super();
    this.isPlanMode = isPlanMode;
  }

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    if (this.isPlanMode) {
      // Inject plan mode instructions
      createdMessage.message.messages.push({
        role: 'system',
        content: `You are in PLAN MODE. Only use read-only tools.
Follow the 4-phase planning workflow:
1. Requirements Understanding
2. Project Exploration
3. Design & Planning
4. Review & Approval`
      });
    }
    return createdMessage;
  }
}
```

---

## 7. Dynamic Prompt Updates

### Gemini CLI

```typescript
// System instruction can be updated mid-session:
GeminiClient.updateSystemInstruction() → getCoreSystemPrompt(config, memory)
GeminiClient.setTools() → toolRegistry.getFunctionDeclarations()
```

Triggered when:
- Config changes (model switch, approval mode)
- Memory updates (user edits GEMINI.md)
- Tool registry changes (MCP servers connect/disconnect)

### Codebolt Equivalent

In Codebolt, the `InitialPromptGenerator` runs fresh for each message, so updates are automatic:

```typescript
codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  // Fresh prompt generation on each message picks up:
  // - Current memory state (via GeminiMemoryModifier)
  // - Current tool list (via ToolInjectionModifier)
  // - Current IDE state (via IdeContextModifier)
  // - Current directory tree (via DirectoryContextModifier)
  let prompt = await promptGenerator.processMessage(reqMessage);
  // ... loop
});
```

No explicit `updateSystemInstruction()` needed — the modifier pipeline always reflects current state.

---

## 8. Compression Prompt

### Gemini CLI

Uses a specialized compression system prompt instructing the LLM to create an XML `<state_snapshot>` with 7 sections (overall_goal, active_constraints, key_knowledge, artifact_trail, file_system_state, recent_actions, task_state).

### Codebolt Equivalent

The `ConversationCompactorModifier` with `compactStrategy: 'smart'` handles compression internally. If the Gemini-style XML format is desired, a custom compaction strategy can be implemented:

```typescript
new ConversationCompactorModifier({
  compactStrategy: 'smart',
  compressionTokenThreshold: 0.5
  // The smart strategy handles history summarization internally
  // It provides equivalent functionality to Gemini's compression
})
```

For exact Gemini-style compression, a custom `BasePostToolCallProcessor` could be written that implements the XML state_snapshot format.

---

## 9. Prompt Section → Modifier Responsibility Matrix

| Prompt Section | Who Provides It | When It Changes |
|---------------|----------------|-----------------|
| Chat history | `ChatHistoryMessageModifier` | Every turn (accumulates) |
| Date, OS, CWD | `EnvironmentContextModifier` | Session start (static) |
| Folder tree | `DirectoryContextModifier` | Session start (can refresh) |
| IDE state | `IdeContextModifier` | Every turn (delta updates) |
| System identity + rules | `CoreSystemPromptModifier` | Static (configured once) |
| User/project memory | `GeminiMemoryModifier` (custom) | When memory updated |
| Tool declarations | `ToolInjectionModifier` | When tools change |
| @file mentions | `AtFileProcessorModifier` | Per message (user mentions) |
| Compression context | `ChatCompressionModifier` / `ConversationCompactorModifier` | When token limit approached |

---

## 10. Prompt Size Comparison

| Metric | Gemini CLI | Codebolt Agent |
|--------|-----------|----------------|
| System instruction | ~40KB (snippets.ts) | Configurable (custom system prompt) |
| Environment context | ~2-5KB (depends on folder tree) | Equivalent (built-in modifiers) |
| Tool declarations | ~5-15KB (depends on tool count) | Equivalent (ToolInjectionModifier) |
| IDE context | ~1-3KB (first turn full, then deltas) | Equivalent (IdeContextModifier) |
| Chat history | Grows with conversation | Managed by compression modifiers |
| **Total initial prompt** | **~50-65KB** | **~50-65KB** (comparable) |
