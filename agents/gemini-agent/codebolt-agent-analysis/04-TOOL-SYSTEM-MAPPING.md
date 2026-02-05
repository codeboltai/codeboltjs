# Gemini CLI Tool System → Codebolt Tool System Mapping

> **Purpose:** Map every aspect of Gemini CLI's tool execution pipeline — registry, scheduler, executor, hooks, policy, built-in tools — to Codebolt's MCP-based tool system.

---

## 1. Tool System Architecture Comparison

### Gemini CLI Tool Pipeline

```
Model Response (functionCall)
  → Turn.handlePendingFunctionCall()
    → CoreToolScheduler.schedule()
      → ToolRegistry.getTool() → Build invocation
      → PolicyEngine.evaluate() → ALLOW/DENY/ASK_USER
      → [awaiting_approval] → User confirms
      → ToolExecutor.execute()
        → executeToolWithHooks()
          → BeforeTool hook
          → invocation.execute()
          → AfterTool hook
      → onAllToolCallsComplete()
        → functionResponse → history → next turn
```

### Codebolt Tool Pipeline

```
LLM Response (tool_calls)
  → ResponseExecutor.executeResponse()
    → [PreToolCallProcessors]
    → Route by naming convention:
      → "codebolt--toolName" → codebolt.mcp.executeTool('codebolt', 'toolName', args)
      → "subagent--name" → codebolt.agent.startAgent()
      → "attempt_completion" → mark completed
    → Codebolt Application handles: [permission check] → [user approval]
    → Tool result added to nextMessage
    → [PostToolCallProcessors]
    → Returns { completed, nextMessage }
```

### Key Simplifications in Codebolt

1. **No state machine needed** — ResponseExecutor handles all states internally
2. **No policy engine in agent code** — Codebolt Application handles permissions
3. **No confirmation UI logic** — Platform handles approval dialogs
4. **Automatic routing** — Tool naming convention handles dispatch
5. **No hook middleware needed** — Processors replace hooks cleanly

---

## 2. Built-in Tool Mapping

### 2.1 File Operations

| Gemini Tool | Name | Codebolt MCP Tool | Parameters Mapping |
|------------|------|-------------------|-------------------|
| `ReadFile` | `read_file` | `codebolt--readFile` | `{ path }` → `{ path }` |
| `WriteFile` | `write_file` | `codebolt--writeFile` | `{ path, content }` → `{ path, content }` |
| `Edit` | `edit` | `codebolt--editFile` | `{ file_path, old_string, new_string }` → similar params |
| `Ls` | `ls` | `codebolt--listFiles` | `{ path, recursive? }` → `{ path, recursive? }` |

### 2.2 Search Operations

| Gemini Tool | Name | Codebolt MCP Tool | Parameters Mapping |
|------------|------|-------------------|-------------------|
| `Grep` | `grep` | `codebolt--searchFiles` | `{ pattern, path, include? }` → `{ query, path? }` |
| `RipGrep` | `ripGrep` | `codebolt--searchFiles` | Same as grep (variant) |
| `Glob` | `glob` | `codebolt--listFiles` | `{ pattern, path }` → `{ path, pattern? }` |

### 2.3 Execution

| Gemini Tool | Name | Codebolt MCP Tool | Parameters Mapping |
|------------|------|-------------------|-------------------|
| `Shell` | `shell` | `codebolt--executeCommand` | `{ command, description?, dir_path?, is_background? }` → `{ command }` |

### 2.4 Network

| Gemini Tool | Name | Codebolt MCP Tool | Notes |
|------------|------|-------------------|-------|
| `WebFetch` | `web_fetch` | `codebolt--webFetch` (if available) | May need custom implementation |
| `WebSearch` | `web_search` | `codebolt--webSearch` (if available) | May need custom implementation |

### 2.5 Memory

| Gemini Tool | Name | Codebolt Equivalent | Notes |
|------------|------|---------------------|-------|
| `Memory` | `memory` | `codebolt.memory` APIs | Must implement as custom tool or ActionBlock |

### 2.6 Special Tools

| Gemini Tool | Codebolt Equivalent | Notes |
|------------|---------------------|-------|
| `ask_user` | Built into Codebolt chat | Use `codebolt.chat.sendMessage()` for questions |
| `exit_plan_mode` | Custom implementation | Switch from plan mode to execution |
| `write_todos` | `codebolt.todo` APIs | Task tracking |
| `activate_skill` | Codebolt Skills system | Platform-managed |
| `codebase_investigator` (agent) | `codebolt.agent.startAgent()` | Sub-agent invocation |

---

## 3. Tool Registry → Codebolt MCP System

### Gemini CLI ToolRegistry

```typescript
class ToolRegistry {
  allKnownTools: Map<string, AnyDeclarativeTool>;
  excludeTools?: Set<string>;

  registerTool(tool): void;
  getTool(name): AnyDeclarativeTool | undefined;
  getFunctionDeclarations(): FunctionDeclaration[];
  getAllToolNames(): string[];
  discoverAllTools(): Promise<void>;
}
```

### Codebolt Equivalent

Codebolt doesn't require manual tool registry management. Tools are:

1. **MCP tools** — Available from connected MCP servers (auto-discovered)
2. **Filtered by `allowedTools`** — The `ToolInjectionModifier` restricts which tools the LLM sees
3. **Executed via naming convention** — `ResponseExecutor` routes `toolbox--toolname` to `codebolt.mcp.executeTool()`

```typescript
// Gemini: Manual tool registration
toolRegistry.registerTool(new ShellTool());
toolRegistry.registerTool(new ReadFileTool());

// Codebolt: Automatic from MCP + filtering
new ToolInjectionModifier({
  includeToolDescriptions: true,
  allowedTools: [
    'codebolt--readFile',
    'codebolt--writeFile',
    'codebolt--editFile',
    'codebolt--executeCommand',
    'codebolt--listFiles',
    'codebolt--searchFiles'
  ]
})
```

### Tool Discovery

| Gemini | Codebolt |
|--------|----------|
| `discoverAllTools()` spawns child process | MCP servers auto-discovered by platform |
| `DiscoveredTool` instances from JSON output | MCP tools registered when server connects |
| 3 priority levels (built-in, discovered, MCP) | All MCP tools at same level |
| `TOOL_LEGACY_ALIASES` for renamed tools | Not needed (stable naming) |

---

## 4. Tool Execution State Machine → ResponseExecutor

### Gemini CLI: 7-State Machine

```
validating → [Policy] → awaiting_approval → scheduled → executing → success/error/cancelled
                │ DENY                ↑ Cancel
                ▼              cancelled
              error
```

### Codebolt: Simplified by Platform

```
LLM tool_call
  → ResponseExecutor parses tool name
  → codebolt.mcp.executeTool(server, tool, args)
    → [Codebolt App: permission check → approval UI → execute]
    → Returns [didUserReject, result]
  → If rejected: skip remaining tools
  → Add result to message history
```

**State mapping:**

| Gemini State | Codebolt Equivalent | Notes |
|-------------|---------------------|-------|
| `validating` | Internal to `ResponseExecutor` | Auto-validated via MCP schema |
| `awaiting_approval` | **Codebolt Application** | Platform shows approval UI |
| `scheduled` | Internal to `ResponseExecutor` | Immediate after approval |
| `executing` | `codebolt.mcp.executeTool()` in progress | Async execution |
| `success` | Tool returns result | `[false, result]` |
| `error` | Tool returns error | Error in result |
| `cancelled` | User rejects | `[true, _]` → skip batch |

### User Rejection Handling

**Gemini:**
```typescript
// cancelAll() cancels all queued tools
// handleConfirmationResponse(Cancel) → set all to 'cancelled'
```

**Codebolt:**
```typescript
const [didUserReject, result] = await codebolt.mcp.executeTool('codebolt', 'writeFile', args);
if (didUserReject) {
  // ResponseExecutor automatically stops executing remaining tools in batch
  // Agent gracefully handles the rejection
}
```

---

## 5. Tool Execution Hooks → Codebolt Processors

### Gemini: executeToolWithHooks()

```
BeforeTool hook:
  ├─ Can STOP execution
  ├─ Can BLOCK execution
  └─ Can MODIFY tool input

invocation.execute()

AfterTool hook:
  ├─ Can STOP execution
  ├─ Can BLOCK execution
  └─ Can ADD context to result (<hook_context>)
```

### Codebolt: PreToolCallProcessor + PostToolCallProcessor

```typescript
// Before tool execution
class BeforeToolProcessor extends BasePreToolCallProcessor {
  async modify(input: PreToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const toolCalls = input.rawLLMResponseMessage.choices?.[0]?.message?.tool_calls || [];

    for (const toolCall of toolCalls) {
      // Equivalent to BeforeTool hook:
      // - Can modify args
      // - Can set shouldExit = true (equivalent to STOP)
      // - Can add warning messages

      if (isDangerousCommand(toolCall)) {
        return { nextPrompt: input.nextPrompt, shouldExit: true };
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}

// After tool execution
class AfterToolProcessor extends BasePostToolCallProcessor {
  async modify(input: PostToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const { toolResults } = input;

    // Equivalent to AfterTool hook:
    // - Can inspect results
    // - Can add context to messages
    // - Can set shouldExit = true

    if (toolResults) {
      for (const result of toolResults) {
        if (typeof result.content === 'string' && result.content.includes('CRITICAL_ERROR')) {
          return { nextPrompt: input.nextPrompt, shouldExit: true };
        }
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

---

## 6. Policy Engine → Codebolt Platform Permissions

### Gemini CLI PolicyEngine

```typescript
PolicyEngine.evaluate(toolName, args, approvalMode) → ALLOW | DENY | ASK_USER

// Rules matched by:
// 1. Approval mode (DEFAULT, AUTO_EDIT, YOLO, PLAN)
// 2. Tool name (exact or wildcard)
// 3. Args pattern (regex)
// 4. Priority (highest wins)

// Special protections:
// - Shell redirection detection
// - Command analysis for dangerous patterns
// - YOLO mode auto-approve
// - PLAN mode read-only
```

### Codebolt: No Agent-Side Policy Needed

The Codebolt application handles ALL permission logic:

```
Agent calls codebolt.mcp.executeTool()
  → Codebolt Application intercepts
  → Checks tool permissions
  → Shows approval dialog if needed
  → Returns [didUserReject, result]
```

**What the agent declares (via `allowedTools`):**
```typescript
// In the agent, restrict which tools are visible:
new ToolInjectionModifier({
  allowedTools: ['codebolt--readFile', 'codebolt--writeFile', ...]
})
```

**What the platform enforces:**
- User can approve/deny any tool execution
- Workspace boundary enforcement
- Tool availability filtering
- Session permission state

---

## 7. Shell Tool Deep Dive

### Gemini CLI Shell Tool

The shell tool is the most complex built-in tool with:
- PTY handling
- Signal management (SIGINT/SIGTERM)
- Inactivity timeout
- Working directory tracking
- Environment sanitization
- Background process support
- Binary stream detection
- Live output streaming
- PID tracking

### Codebolt Shell Equivalent

```typescript
// Gemini: shell tool with full execution trace
// ShellToolInvocation.execute() → ShellExecutionService → PTY → output

// Codebolt: Single MCP call
const [rejected, result] = await codebolt.mcp.executeTool(
  'codebolt',
  'executeCommand',
  { command: 'npm test' }
);
```

The Codebolt platform's `executeCommand` tool handles:
- Command execution in the workspace
- Output capture and streaming
- Timeout management
- Working directory context

**Key difference:** Gemini manages shell complexity in agent code; Codebolt delegates to the platform. The agent is simpler but has less control over execution details.

### For advanced shell scenarios

If more control is needed (background processes, PID tracking), use Level 1 APIs:

```typescript
// Direct terminal API for advanced scenarios
const output = await codebolt.terminal.executeCommand('npm test', true);
// OR
const output = await codebolt.terminal.executeCommandRunUntilError('npm test');
```

---

## 8. Tool Output Handling

### Gemini CLI

```typescript
interface ToolResult {
  llmContent: PartListUnion;     // For LLM: factual outcome
  returnDisplay: ToolResultDisplay; // For user: formatted output
  error?: { message, type? };
  data?: Record<string, unknown>;
}

// Output truncation for large results:
// Shell outputs > threshold → save full to temp file, keep last N lines
// Compression: old tool outputs → truncate to 30 lines
```

### Codebolt Equivalent

Tool results are handled by `ResponseExecutor`:
- Results automatically added to conversation history
- The `ConversationCompactorModifier` handles output compression
- Large outputs managed by the compaction strategy

```typescript
new ConversationCompactorModifier({
  compactStrategy: 'smart',
  compressionTokenThreshold: 0.5
  // Automatically handles large tool outputs
})
```

---

## 9. Custom/Local Tools

### Gemini CLI: DiscoveredTool

```
config.toolDiscoveryCommand → spawn process → JSON output → register DiscoveredTool
DiscoveredTool.execute() → spawn subprocess → JSON stdin/stdout → result
```

### Codebolt: Two Approaches

**Approach 1: PreToolCallProcessor (intercept and handle)**

```typescript
class CustomToolProcessor extends BasePreToolCallProcessor {
  async modify(input: PreToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    const toolCalls = input.rawLLMResponseMessage.choices?.[0]?.message?.tool_calls || [];

    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'custom_memory_tool') {
        // Handle custom tool locally
        const args = JSON.parse(toolCall.function.arguments);
        const result = await handleMemoryTool(args);

        input.nextPrompt.message.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

**Approach 2: MCP Server (standalone, shared)**

```typescript
import { MCPServer } from '@codebolt/mcp';
import { z } from 'zod';

const server = new MCPServer({ name: 'gemini-tools', version: '1.0.0' });

server.addTool({
  name: 'memory',
  description: 'Read or write to persistent memory',
  parameters: z.object({
    action: z.enum(['read', 'write']),
    key: z.string(),
    value: z.string().optional()
  }),
  execute: async (args) => {
    if (args.action === 'write') {
      await codebolt.memory.json.save({ [args.key]: args.value });
      return `Saved "${args.key}"`;
    } else {
      const data = await codebolt.memory.json.load(args.key);
      return JSON.stringify(data);
    }
  }
});

await server.start({ transportType: 'stdio' });
```

---

## 10. Tool Confirmation Details Mapping

### Gemini CLI Confirmation Types

| Type | UI Shows | Codebolt |
|------|----------|----------|
| `ToolEditConfirmationDetails` | File diff (before/after) | Platform shows diff for writeFile/editFile |
| `ToolExecuteConfirmationDetails` | Command + root command | Platform shows command for executeCommand |
| `ToolMcpConfirmationDetails` | MCP tool details | Platform shows MCP tool info |
| `ToolInfoConfirmationDetails` | Generic info | Platform shows generic approval |
| `ToolAskUserConfirmationDetails` | User question | Via `codebolt.chat.sendMessage()` |
| `ToolExitPlanModeConfirmationDetails` | Plan mode exit | Custom implementation |

**All handled by Codebolt platform** — no confirmation UI code needed in the agent.

---

## 11. Tool Execution Order

### Gemini CLI

Tools execute **one at a time sequentially** via the queue:
```
toolCalls[] (active: 0 or 1) → toolCallQueue[] (pending) → completedToolCallsForBatch[]
```

### Codebolt

`ResponseExecutor` handles tool execution order internally. The Gemini CLI's sequential execution model is the default behavior — tools from a single LLM response are processed in order.

---

## 12. Sub-Agent Tools

### Gemini CLI

```
Model calls: functionCall { name: "codebase_investigator", args: { query } }
  → SubagentToolWrapper
    → LocalAgentExecutor with isolated tool registry
    → Agent-specific system prompt + restricted tools
    → Returns structured output
```

### Codebolt Equivalent

```
Model calls: tool_call { name: "subagent--codebase_investigator", args: { task } }
  → ResponseExecutor routes to subagent handler
    → codebolt.agent.startAgent('codebase_investigator', args.task)
    → Returns agent output
```

Or use `codebolt.thread.createThreadInBackground()` for async sub-agent execution:

```typescript
// Synchronous sub-agent
const result = await codebolt.agent.startAgent('codebase_investigator', task);

// Async sub-agent (background thread)
const thread = await codebolt.thread.createThreadInBackground({
  agentName: 'codebase_investigator',
  task: query
});
// Check results via agentEventQueue
```

---

## 13. Summary: What the Agent Code Needs vs. Platform Handles

### Agent Code Responsibilities

| Responsibility | Implementation |
|---------------|----------------|
| Declare allowed tools | `allowedTools` in `ToolInjectionModifier` |
| Handle custom tools | `PreToolCallProcessor` or MCP server |
| Process tool results | `PostToolCallProcessor` (if custom logic needed) |
| Manage sub-agents | `codebolt.agent.startAgent()` calls |

### Platform Responsibilities (Zero Agent Code)

| Responsibility | Platform Mechanism |
|---------------|-------------------|
| Tool execution | `codebolt.mcp.executeTool()` → platform runs the tool |
| Permission checks | Platform evaluates tool permissions |
| User approval UI | Platform shows approval dialog |
| Rejection handling | Returns `[didUserReject, result]` |
| Workspace boundaries | Platform enforces file/dir limits |
| Tool discovery | MCP servers auto-discovered |
| Output streaming | Platform handles live output |
