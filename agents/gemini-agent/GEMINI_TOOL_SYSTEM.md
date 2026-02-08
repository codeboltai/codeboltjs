# Gemini CLI Tool Execution System — Deep Analysis

> **Scope:** Tool registry, base interfaces, scheduler state machine, executor, hook triggers, policy engine, and built-in tools.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tool Registry](#2-tool-registry)
3. [Base Tool Interfaces](#3-base-tool-interfaces)
4. [CoreToolScheduler State Machine](#4-coretoolscheduler-state-machine)
5. [ToolExecutor](#5-toolexecutor)
6. [Hook Triggers (executeToolWithHooks)](#6-hook-triggers-executetoolwithhooks)
7. [Policy Engine Integration](#7-policy-engine-integration)
8. [Shell Tool — Complete Execution Trace](#8-shell-tool--complete-execution-trace)
9. [Built-in Tool Inventory](#9-built-in-tool-inventory)
10. [Scheduler Types](#10-scheduler-types)
11. [Tool Results & Confirmation System](#11-tool-results--confirmation-system)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ MODEL RESPONSE: functionCall { name: "shell", args: { command } }   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Turn.handlePendingFunctionCall()                                     │
│ Creates ToolCallRequestInfo { callId, name, args, prompt_id }        │
│ Adds to turn.pendingToolCalls[]                                      │
│ Yields ToolCallRequest event                                         │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CoreToolScheduler.schedule(toolCalls[])                               │
│ File: core/coreToolScheduler.ts                                      │
│                                                                      │
│  validating → [Policy] → awaiting_approval → scheduled → executing   │
│                  │ DENY              ↑ Cancel                        │
│                  ▼              cancelled                             │
│                error                                                 │
│                                                                      │
│  ToolExecutor.execute()                                              │
│  └─ executeToolWithHooks()                                           │
│     ├─ BeforeTool hook                                               │
│     ├─ invocation.execute()                                          │
│     └─ AfterTool hook                                                │
│                                                                      │
│  → success | error | cancelled                                       │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│ onAllToolCallsComplete(completedToolCalls)                           │
│ Builds functionResponse Content                                      │
│ Adds to chat history                                                 │
│ Triggers recursive sendMessageStream() with tool results             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tool Registry

**File:** `packages/core/src/tools/tool-registry.ts`

### Class: ToolRegistry

```typescript
class ToolRegistry {
  private allKnownTools: Map<string, AnyDeclarativeTool>;  // name → tool
  private excludeTools?: Set<string>;  // from config
}
```

### Key Methods

#### Registration

```typescript
registerTool(tool: AnyDeclarativeTool): void
  // Adds tool to allKnownTools map
  // Handles duplicate registration with logging
  // Supports MCP fully qualified names

unregisterTool(name: string): void
  // Removes tool by name
```

#### Retrieval — Function Declarations (for LLM)

```typescript
getFunctionDeclarations(): FunctionDeclaration[]
  // Returns OpenAPI-style schemas for ALL ACTIVE tools
  // Filters by activation status via getActiveTools()
  // Used when building GeminiChat: tools = [{ functionDeclarations }]

getFunctionDeclarationsFiltered(toolNames: string[]): FunctionDeclaration[]
  // Returns schemas for specific tool names only
```

#### Tool Lookup

```typescript
getTool(name: string): AnyDeclarativeTool | undefined
  // Direct lookup by name
  // Checks activation status
  // Supports legacy aliases via TOOL_LEGACY_ALIASES map
  // Supports MCP qualified names (contains "__")
  // Returns undefined if not found or inactive

getAllToolNames(): string[]
  // Returns names of ALL ACTIVE tools
  // Used in system prompt for ${AvailableTools} substitution

getAllTools(): AnyDeclarativeTool[]
  // Returns all ACTIVE tool instances
  // Sorted by displayName alphabetically
```

#### Discovery

```typescript
async discoverAllTools(): Promise<void>
  // Removes all previously discovered tools
  // Calls discoverAndRegisterToolsFromCommand()

private async discoverAndRegisterToolsFromCommand(): Promise<void>
  // Executes tool discovery command from config
  // Spawns child process
  // Parses stdout as JSON array of function declarations
  // Supports both "function_declarations" and "functionDeclarations" formats
  // 10MB size limit for stdout/stderr
  // Creates DiscoveredTool instances for each
```

#### Sorting & Filtering

```typescript
sortTools(): void
  // Stable sort by priority:
  //   0: Built-in tools
  //   1: Discovered tools
  //   2: MCP tools (sub-sorted by server name)

private getActiveTools(): AnyDeclarativeTool[]
  // Filters allKnownTools against excludeTools set
  // Returns tools where isActiveTool() = true

private isActiveTool(tool, excludeTools?): boolean
  // Checks tool NOT in excludeTools
  // Normalizes names (removes leading underscores)
  // For MCP: checks both qualified and unqualified names
```

---

## 3. Base Tool Interfaces

**File:** `packages/core/src/tools/tools.ts`

### Interface Hierarchy

```
DeclarativeTool (abstract)
  └─ BaseDeclarativeTool (abstract)
       └─ Concrete tools (ShellTool, EditTool, ReadFileTool, ...)

ToolInvocation (interface)
  └─ BaseToolInvocation (abstract)
       └─ Concrete invocations (ShellToolInvocation, ...)
```

### ToolInvocation Interface

```typescript
interface ToolInvocation<TParams extends object, TResult extends ToolResult> {
  params: TParams;

  getDescription(): string;
    // Markdown description of what tool will do

  toolLocations(): ToolLocation[];
    // File system paths the tool will affect
    // Each: { path: string; line?: number }

  shouldConfirmExecute(abortSignal: AbortSignal): Promise<ToolCallConfirmationDetails | false>;
    // false = no confirmation needed
    // ToolCallConfirmationDetails = show confirmation UI

  execute(
    signal: AbortSignal,
    updateOutput?: (output: string | AnsiOutput) => void,
    shellExecutionConfig?: ShellExecutionConfig,
    setPidCallback?: (pid: number) => void,
  ): Promise<TResult>;
}
```

### ToolResult Interface

```typescript
interface ToolResult {
  llmContent: PartListUnion;
    // Content for LLM history (factual outcome)
    // Can be string, Part[], or object

  returnDisplay: ToolResultDisplay;
    // User-friendly display
    // Type: string | FileDiff | AnsiOutput | TodoList

  error?: {
    message: string;
    type?: ToolErrorType;  // Machine-readable error classification
  };

  data?: Record<string, unknown>;
    // Optional structured data payload
}
```

### ToolErrorType Enum

```typescript
enum ToolErrorType {
  TOOL_NOT_REGISTERED = 'tool_not_registered',
  INVALID_TOOL_PARAMS = 'invalid_tool_params',
  UNHANDLED_EXCEPTION = 'unhandled_exception',
  EXECUTION_FAILED = 'execution_failed',
  STOP_EXECUTION = 'stop_execution',
  CANCELLED = 'cancelled',
}
```

### Kind Enum (Tool Categorization)

```typescript
enum Kind {
  Read = 'read',
  Edit = 'edit',
  Delete = 'delete',
  Move = 'move',
  Search = 'search',
  Execute = 'execute',
  Think = 'think',
  Fetch = 'fetch',
  Communicate = 'communicate',
  Plan = 'plan',
  Other = 'other',
}

// Mutator kinds (tools with side effects):
const MUTATOR_KINDS = [Kind.Edit, Kind.Delete, Kind.Move, Kind.Execute];
```

### DeclarativeTool Abstract Class

```typescript
abstract class DeclarativeTool {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly kind: Kind;
  readonly parameterSchema: unknown;       // JSON Schema for params
  readonly messageBus: MessageBus;
  readonly isOutputMarkdown: boolean;
  readonly canUpdateOutput: boolean;       // Supports streaming output
  readonly extensionName?: string;
  readonly extensionId?: string;

  get schema(): FunctionDeclaration {
    // Converts to @google/genai FunctionDeclaration
    return { name, description, parametersJsonSchema };
  }

  abstract build(params: TParams): ToolInvocation<TParams, TResult>;
    // Validates params and creates invocation instance

  async buildAndExecute(params, signal, updateOutput?): Promise<TResult>;
    // build() + execute() in one step

  async validateBuildAndExecute(params, abortSignal): Promise<ToolResult>;
    // Never throws. Returns ToolResult with error field on failure.
}
```

### BaseDeclarativeTool Abstract Class

```typescript
abstract class BaseDeclarativeTool extends DeclarativeTool {
  build(params: TParams): ToolInvocation {
    const error = this.validateToolParams(params);
    if (error) throw new Error(error);
    return this.createInvocation(params, this.messageBus, this.name, this.displayName);
  }

  override validateToolParams(params): string | null {
    // 1. JSON Schema validation via SchemaValidator.validate()
    // 2. Custom value validation via validateToolParamValues()
    return firstErrorOrNull;
  }

  protected validateToolParamValues(params): string | null {
    return null; // Override for custom validation
  }

  protected abstract createInvocation(
    params, messageBus, toolName?, toolDisplayName?
  ): ToolInvocation;
}
```

### BaseToolInvocation Abstract Class

```typescript
abstract class BaseToolInvocation {
  constructor(
    readonly params: TParams,
    protected readonly messageBus: MessageBus,
    readonly _toolName?: string,
    readonly _toolDisplayName?: string,
    readonly _serverName?: string,  // For MCP tools
  ) {}

  async shouldConfirmExecute(abortSignal): Promise<ToolCallConfirmationDetails | false> {
    const decision = await this.getMessageBusDecision(abortSignal);
    if (decision === 'ALLOW') return false;
    if (decision === 'DENY') throw new Error('Denied by policy');
    return this.getConfirmationDetails(abortSignal);
  }

  protected async getMessageBusDecision(abortSignal): Promise<'ALLOW' | 'DENY' | 'ASK_USER'> {
    // Publishes ToolConfirmationRequest to message bus
    // Waits for ToolConfirmationResponse (30s timeout)
    // Returns 'ALLOW' if no message bus configured
  }

  protected async getConfirmationDetails(abortSignal): Promise<ToolCallConfirmationDetails | false> {
    // Default: generic info confirmation
    // Subclasses override for custom UI (diff preview, command preview, etc.)
  }

  protected async publishPolicyUpdate(outcome): Promise<void> {
    // For ProceedAlways outcomes: publish UPDATE_POLICY message
    // Includes optional policy options (commandPrefix, mcpName, etc.)
  }

  abstract execute(signal, updateOutput?, shellConfig?, setPidCallback?): Promise<TResult>;
}
```

---

## 4. CoreToolScheduler State Machine

**File:** `packages/core/src/core/coreToolScheduler.ts` (~1000 lines)

### 7 States

```typescript
type Status =
  | 'validating'         // Initial: building invocation, validating params
  | 'awaiting_approval'  // Waiting for user confirmation
  | 'scheduled'          // Approved, ready to execute
  | 'executing'          // Currently running
  | 'success'            // Terminal: completed successfully
  | 'error'              // Terminal: failed
  | 'cancelled'          // Terminal: user cancelled
```

### State Transition Diagram

```
                    schedule(requests)
                         │
                         ▼
               ┌──────────────────┐
               │   validating     │ ◄─── Build invocation + validate params
               └────────┬─────────┘
                        │
                PolicyEngine.evaluate(toolName, args, approvalMode)
                        │
           ┌────────────┼────────────────┐
           │            │                │
      ALLOW/ALWAYS      │           ASK_USER
           │            │                │
           │         DENY                │
           │            │                │
           │            ▼                ▼
           │      ┌──────────┐  ┌──────────────────────┐
           │      │  error   │  │  awaiting_approval   │
           │      │(terminal)│  │  ┌─ shows diff/cmd ─┐│
           │      │ + deny   │  │  │ confirmDetails   ││
           │      │ message  │  │  └──────────────────┘│
           │      └──────────┘  └──────────┬───────────┘
           │                               │
           │               handleConfirmationResponse()
           │                               │
           │            ┌──────────────────┼──────────────────┐
           │            │                  │                   │
           │       ProceedOnce        ModifyWithEditor      Cancel
           │       ProceedAlways      (re-confirms)           │
           │       ProceedAlwaysSave                           ▼
           │            │                              ┌──────────────┐
           │            │                              │  cancelled   │
           │            │                              │  (terminal)  │
           │            │                              └──────────────┘
           │            │
           ▼            ▼
    ┌──────────────────────┐
    │      scheduled       │
    └──────────┬───────────┘
               │
       attemptExecutionOfScheduledCalls()
               │
               ▼
    ┌──────────────────────┐
    │     executing        │ ◄─── setPidCallback for shell tools
    │     liveOutput       │      liveOutput streaming
    └──────────┬───────────┘
               │
         ToolExecutor.execute()
         └─ executeToolWithHooks()
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐     ┌──────────┐
│ success  │     │  error   │
│(terminal)│     │(terminal)│
└──────────┘     └──────────┘
```

### Queue Architecture

```typescript
class CoreToolScheduler {
  private toolCalls: ToolCall[] = [];                    // Active tool (0 or 1)
  private toolCallQueue: ToolCall[] = [];                // Pending queue
  private completedToolCallsForBatch: CompletedToolCall[] = [];
  private requestQueue: Array<{
    request: ToolCallRequestInfo | ToolCallRequestInfo[];
    signal: AbortSignal;
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  private isFinalizingToolCalls = false;   // Batch finalization lock
  private isScheduling = false;            // Schedule operation lock
  private isCancelling = false;            // Cancellation in progress
}
```

### Core Methods

#### schedule() — Public Entry Point

```typescript
async schedule(
  request: ToolCallRequestInfo | ToolCallRequestInfo[],
  signal: AbortSignal
): Promise<void> {
  if (this.isRunning() || this.isScheduling) {
    // Queue the request, return promise
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, signal, resolve, reject });
    });
  }
  // Process immediately
  return this._schedule(request, signal);
}
```

#### _schedule() — Internal Setup

```typescript
private async _schedule(request, signal): Promise<void> {
  this.isScheduling = true;
  this.isCancelling = false;
  this.completedToolCallsForBatch = [];

  const requests = Array.isArray(request) ? request : [request];

  for (const req of requests) {
    // Look up tool in registry
    const tool = this.config.getToolRegistry().getTool(req.name);
    if (!tool) {
      // Create ErroredToolCall: TOOL_NOT_REGISTERED
      continue;
    }

    // Build invocation
    const invocation = this.buildInvocation(tool, req.args);
    if (invocation instanceof Error) {
      // Create ErroredToolCall: INVALID_TOOL_PARAMS
      continue;
    }

    // Create ValidatingToolCall
    this.toolCallQueue.push({
      status: 'validating',
      request: req,
      tool,
      invocation,
      startTime: Date.now(),
    });
  }

  await this._processNextInQueue(signal);
  this.isScheduling = false;
}
```

#### _processNextInQueue() — Sequential Processing

```typescript
private async _processNextInQueue(signal: AbortSignal): Promise<void> {
  // One at a time
  if (this.toolCalls.length > 0 || this.toolCallQueue.length === 0) return;

  if (signal.aborted) {
    this._cancelAllQueuedCalls();
    this.checkAndNotifyCompletion(signal);
    return;
  }

  // Dequeue single call
  const toolCall = this.toolCallQueue.shift()!;
  this.toolCalls = [toolCall];

  if (toolCall.status === 'error') {
    // Already errored during _schedule
    this.checkAndNotifyCompletion(signal);
    return;
  }

  // VALIDATION PHASE
  try {
    if (signal.aborted) {
      this.setStatusInternal(toolCall.request.callId, 'cancelled', signal);
      return;
    }

    // Policy check
    const policyDecision = await PolicyEngine.evaluate(
      toolCall.request.name,
      toolCall.request.args,
      this.config.getApprovalMode()
    );

    if (policyDecision === 'DENY') {
      this.setStatusInternal(callId, 'error', signal, getPolicyDenialError());
    } else if (policyDecision === 'ALLOW') {
      this.setStatusInternal(callId, 'scheduled', signal);
    } else {
      // ASK_USER
      const confirmDetails = await toolCall.invocation.shouldConfirmExecute(signal);
      if (!confirmDetails) {
        this.setStatusInternal(callId, 'scheduled', signal);
      } else {
        // Fire hook notification
        hookSystem?.fireToolNotificationEvent(callId, toolName, toolInput);
        this.setStatusInternal(callId, 'awaiting_approval', signal, confirmDetails);
      }
    }
  } catch (error) {
    this.setStatusInternal(callId, 'error', signal, createErrorResponse(error));
  }

  await this.attemptExecutionOfScheduledCalls(signal);
}
```

#### attemptExecutionOfScheduledCalls()

```typescript
private async attemptExecutionOfScheduledCalls(signal: AbortSignal): Promise<void> {
  for (const call of this.toolCalls) {
    if (call.status !== 'scheduled') continue;

    this.setStatusInternal(call.request.callId, 'executing', signal);

    const completedCall = await this.toolExecutor.execute({
      call,
      signal,
      outputUpdateHandler: this.outputUpdateHandler,
      onUpdateToolCall: (updated) => { /* state update */ },
    });

    // Map completed call back to toolCalls
    this.toolCalls = this.toolCalls.map(tc =>
      tc.request.callId === completedCall.request.callId ? completedCall : tc
    );
  }

  await this.checkAndNotifyCompletion(signal);
}
```

#### checkAndNotifyCompletion()

```typescript
private async checkAndNotifyCompletion(signal: AbortSignal): Promise<void> {
  // Check active tool terminal state
  if (this.toolCalls.length > 0) {
    const activeCall = this.toolCalls[0];
    if (['success', 'error', 'cancelled'].includes(activeCall.status)) {
      this.completedToolCallsForBatch.push(activeCall as CompletedToolCall);
      logToolCall(activeCall);
      this.toolCalls = [];
    } else {
      return; // Still processing
    }
  }

  // Batch completion check
  if (this.toolCallQueue.length === 0 || signal.aborted) {
    if (this.isFinalizingToolCalls) return;
    this.isFinalizingToolCalls = true;

    while (this.completedToolCallsForBatch.length > 0) {
      const batch = [...this.completedToolCallsForBatch];
      this.completedToolCallsForBatch = [];
      await this.onAllToolCallsComplete(batch);
    }

    this.isFinalizingToolCalls = false;

    // Process next request from queue
    if (this.requestQueue.length > 0) {
      const next = this.requestQueue.shift()!;
      try {
        await this._schedule(next.request, next.signal);
        next.resolve();
      } catch (e) {
        next.reject(e as Error);
      }
    }
  } else {
    // More in queue, process next
    await this._processNextInQueue(signal);
  }
}
```

#### handleConfirmationResponse()

```typescript
async handleConfirmationResponse(
  callId: string,
  originalOnConfirm: Function,
  outcome: ToolConfirmationOutcome,
  signal: AbortSignal,
  payload?: unknown,
): Promise<void> {
  await originalOnConfirm(outcome);

  switch (outcome) {
    case ToolConfirmationOutcome.Cancel:
      this.cancelAll(signal);
      break;

    case ToolConfirmationOutcome.ModifyWithEditor:
      // Open external editor, get modified args
      const result = await toolModifier.handleModifyWithEditor(call);
      if (result) this.setArgsInternal(callId, result.args);
      break;

    case 'inline_edit_payload':
      // Apply inline modification
      const inlineResult = toolModifier.applyInlineModify(call, payload);
      if (inlineResult) this.setArgsInternal(callId, inlineResult.args);
      return; // Wait for re-confirmation

    default:
      // ProceedOnce, ProceedAlways, etc.
      this.setStatusInternal(callId, 'scheduled', signal);
  }

  await this.attemptExecutionOfScheduledCalls(signal);
}
```

#### cancelAll()

```typescript
cancelAll(signal: AbortSignal): void {
  this.isCancelling = true;

  for (const call of this.toolCalls) {
    if (['validating', 'awaiting_approval', 'scheduled'].includes(call.status)) {
      this.setStatusInternal(call.request.callId, 'cancelled', signal);
    }
    // 'executing' tools are cancelled via signal
  }

  this._cancelAllQueuedCalls();
  this.checkAndNotifyCompletion(signal);
}
```

---

## 5. ToolExecutor

**File:** `packages/core/src/scheduler/tool-executor.ts`

```typescript
class ToolExecutor {
  constructor(private readonly config: Config) {}

  async execute(context: ToolExecutionContext): Promise<CompletedToolCall> {
    const { call, signal, outputUpdateHandler, onUpdateToolCall } = context;
    const { request, tool, invocation } = call;

    // Validate
    if (!tool || !invocation) {
      return createErrorResult(call, 'Tool or invocation missing');
    }

    // Setup live output callback
    let liveOutputCallback: ((chunk: string | AnsiOutput) => void) | undefined;
    if (tool.canUpdateOutput && outputUpdateHandler) {
      liveOutputCallback = (chunk) => outputUpdateHandler(request.callId, chunk);
    }

    const shellExecutionConfig = this.config.getShellExecutionConfig();

    try {
      // Execute with hooks
      let toolResult: ToolResult;

      if (invocation instanceof ShellToolInvocation) {
        const setPidCallback = (pid: number) => {
          onUpdateToolCall({ ...call, pid });
        };
        toolResult = await executeToolWithHooks(
          invocation, request.name, signal, tool,
          liveOutputCallback, shellExecutionConfig, setPidCallback, this.config,
        );
      } else {
        toolResult = await executeToolWithHooks(
          invocation, request.name, signal, tool,
          liveOutputCallback, shellExecutionConfig, undefined, this.config,
        );
      }

      // Check cancellation
      if (signal.aborted) {
        return this.createCancelledResult(call, 'User cancelled');
      }

      // Return result
      if (toolResult.error) {
        return this.createErrorResult(call, toolResult.error.message, toolResult.error.type, toolResult.returnDisplay);
      }
      return this.createSuccessResult(call, toolResult);

    } catch (error) {
      return this.createErrorResult(call, getErrorMessage(error), ToolErrorType.UNHANDLED_EXCEPTION);
    }
  }

  // TRUNCATION LOGIC for success results
  private async createSuccessResult(call, toolResult): Promise<SuccessfulToolCall> {
    // For shell tools: check if output exceeds threshold
    if (isShellTool && truncationEnabled && outputLength > threshold) {
      // Save full output to temp file
      // Format summary: "[Output truncated. Full output saved to: {path}]\n{last N lines}"
      // Log ToolOutputTruncatedEvent
    }

    return {
      status: 'success',
      request: call.request,
      tool: call.tool,
      invocation: call.invocation,
      response: createSuccessResponse(call.request, toolResult),
      durationMs: Date.now() - (call.startTime || 0),
      outcome: call.outcome,
    };
  }
}
```

---

## 6. Hook Triggers (executeToolWithHooks)

**File:** `packages/core/src/core/coreToolHookTriggers.ts`

```typescript
async function executeToolWithHooks(
  invocation: ShellToolInvocation | AnyToolInvocation,
  toolName: string,
  signal: AbortSignal,
  tool: AnyDeclarativeTool,
  liveOutputCallback?: (chunk: string | AnsiOutput) => void,
  shellExecutionConfig?: ShellExecutionConfig,
  setPidCallback?: (pid: number) => void,
  config?: Config,
): Promise<ToolResult>
```

### Execution Flow

```
executeToolWithHooks()
  │
  ├─ 1. EXTRACT INPUT
  │     toolInput = invocation.params
  │
  ├─ 2. SETUP MCP CONTEXT (if MCP tool)
  │     ├─ Check if DiscoveredMCPToolInvocation
  │     ├─ Look up server config from config.getMcpServers()
  │     └─ Create McpToolContext:
  │         { server_name, tool_name, command, args, cwd, url }
  │         (non-sensitive details only — no API keys)
  │
  ├─ 3. BEFORE TOOL HOOK
  │     hookSystem.fireBeforeToolEvent(toolName, toolInput, mcpContext)
  │     │
  │     ├─ shouldStopExecution()?
  │     │   → Return error { type: STOP_EXECUTION, message: reason }
  │     │
  │     ├─ getBlockingError()?
  │     │   → Return error { type: EXECUTION_FAILED, message: reason }
  │     │
  │     └─ getModifiedToolInput()?
  │         ├─ Object.assign(invocation.params, modifiedInput)
  │         ├─ Rebuild invocation: tool.build(invocation.params)
  │         │   If build fails → Return validation error
  │         └─ Set inputWasModified = true
  │
  ├─ 4. EXECUTE TOOL
  │     ├─ If ShellToolInvocation + setPidCallback:
  │     │   invocation.execute(signal, liveOutput, shellConfig, setPidCallback)
  │     └─ Else:
  │         invocation.execute(signal, liveOutput, shellConfig)
  │
  ├─ 5. APPEND MODIFICATION NOTICE (if input was modified)
  │     ├─ Message: "[System] Tool input parameters ({keys}) were modified by hook"
  │     └─ Append to toolResult.llmContent:
  │         ├─ If string: concatenate
  │         ├─ If array: push { text } part
  │         └─ If Part: convert to array, push both
  │
  ├─ 6. AFTER TOOL HOOK
  │     hookSystem.fireAfterToolEvent(toolName, toolInput, toolResult, mcpContext)
  │     │
  │     ├─ shouldStopExecution()?
  │     │   → Return error { type: STOP_EXECUTION }
  │     │
  │     ├─ getBlockingError()?
  │     │   → Return error { type: EXECUTION_FAILED }
  │     │
  │     └─ getAdditionalContext()?
  │         ├─ Wrap: "<hook_context>{context}</hook_context>"
  │         └─ Append to toolResult.llmContent
  │
  └─ 7. RETURN toolResult
```

### Error Priority

1. BeforeTool `shouldStopExecution()` → `STOP_EXECUTION`
2. BeforeTool `getBlockingError()` → `EXECUTION_FAILED`
3. Modified input rebuild failure → `INVALID_TOOL_PARAMS`
4. AfterTool `shouldStopExecution()` → `STOP_EXECUTION`
5. AfterTool `getBlockingError()` → `EXECUTION_FAILED`

---

## 7. Policy Engine Integration

**File:** `packages/core/src/policy/policy-engine.ts`

### Policy Decision Flow

```
PolicyEngine.evaluate(toolName, args, approvalMode) → ALLOW | DENY | ASK_USER

For each rule (sorted by priority, highest first):
  1. Check approval mode filter (DEFAULT, AUTO_EDIT, YOLO, PLAN)
  2. Check tool name match (exact or wildcard: "serverName__*")
  3. Check args pattern match (regex on stable JSON-stringified args)
  4. If all match → apply rule's decision
  5. First matching rule wins (highest priority)
```

### PolicyRule Interface

```typescript
interface PolicyRule {
  toolName?: string;         // Target tool(s), supports wildcards
  argsPattern?: string;      // Regex on JSON-stringified args
  decision: 'ALLOW' | 'DENY' | 'ASK_USER';
  priority: number;          // Higher wins
  modes?: ApprovalMode[];    // Applicable modes
  allowRedirection?: boolean; // Allow shell redirection
  denyMessage?: string;      // Custom denial message
}
```

### Special Protections

#### Shell Redirection Detection

```
If tool is shell AND policy says ALLOW:
  Parse command for redirection operators (>, >>, |, etc.)
  If redirection found AND rule.allowRedirection !== true:
    Downgrade ALLOW → ASK_USER
```

Prevents output tampering attacks where a tool call might redirect output to overwrite critical files.

### Approval Modes

| Mode | Description | Tool Behavior |
|------|-------------|--------------|
| `DEFAULT` | Standard interactive | Policy rules apply normally |
| `AUTO_EDIT` | Auto-approve file edits | Edit/write tools auto-approved |
| `YOLO` | Auto-approve everything | All tools auto-approved |
| `PLAN` | Read-only planning | Only read tools allowed, writes blocked |

### ToolConfirmationOutcome

```typescript
enum ToolConfirmationOutcome {
  ProceedOnce = 'proceed_once',                  // One-time approval
  ProceedAlways = 'proceed_always',              // Session-wide approval
  ProceedAlwaysAndSave = 'proceed_always_and_save',  // Persistent approval
  ProceedAlwaysServer = 'proceed_always_server',     // Approve all tools from MCP server
  ProceedAlwaysTool = 'proceed_always_tool',         // Approve this specific tool
  ModifyWithEditor = 'modify_with_editor',           // Open editor to modify
  Cancel = 'cancel',                                  // Cancel execution
}
```

---

## 8. Shell Tool — Complete Execution Trace

**File:** `packages/core/src/tools/shell.ts`

### Parameters

```typescript
interface ShellToolParams {
  command: string;           // Required: command to execute
  description?: string;      // Optional: human description
  dir_path?: string;         // Optional: working directory
  is_background?: boolean;   // Optional: run in background
}
```

### Complete Execution Trace

```
1. LLM outputs: functionCall { name: "shell", args: { command: "npm test" } }

2. Turn.handlePendingFunctionCall()
   → ToolCallRequestInfo { callId: "call_123", name: "shell", args: { command: "npm test" } }
   → Yield ToolCallRequest event

3. CoreToolScheduler.schedule([requestInfo])
   └─ _schedule():
      ├─ tool = toolRegistry.getTool("shell")  → ShellTool instance
      ├─ invocation = tool.build({ command: "npm test" })
      │   ├─ validateToolParams() → JSON Schema + value checks
      │   └─ createInvocation() → ShellToolInvocation instance
      └─ Push ValidatingToolCall to queue

4. _processNextInQueue():
   ├─ PolicyEngine.evaluate("shell", { command: "npm test" }, approvalMode)
   │   ├─ Check rules for "shell" tool
   │   ├─ Check redirection in "npm test" → none found
   │   └─ Return ASK_USER (default for shell in DEFAULT mode)
   │
   ├─ invocation.shouldConfirmExecute(signal)
   │   ├─ getMessageBusDecision() → ASK_USER
   │   └─ getConfirmationDetails():
   │       ├─ parseCommandDetails("npm test")
   │       ├─ Extract rootCommand: "npm"
   │       └─ Return ToolExecuteConfirmationDetails {
   │            type: 'exec',
   │            title: 'Confirm Shell Command',
   │            command: 'npm test',
   │            rootCommand: 'npm',
   │            rootCommands: ['npm'],
   │            onConfirm: callback
   │          }
   │
   └─ Set status: awaiting_approval + confirmationDetails

5. UI displays confirmation to user
   User clicks "Proceed"

6. handleConfirmationResponse(callId, onConfirm, ProceedOnce, signal)
   ├─ onConfirm(ProceedOnce) → publishPolicyUpdate() if ProceedAlways
   └─ setStatusInternal(callId, 'scheduled')

7. attemptExecutionOfScheduledCalls():
   ├─ setStatusInternal(callId, 'executing')
   └─ toolExecutor.execute(context)

8. ToolExecutor.execute():
   ├─ liveOutputCallback = (chunk) => outputUpdateHandler(callId, chunk)
   ├─ setPidCallback = (pid) => onUpdateToolCall({ ...call, pid })
   └─ executeToolWithHooks(invocation, "shell", signal, tool, ...)

9. executeToolWithHooks():
   ├─ BeforeTool hook → (no modification)
   │
   ├─ ShellToolInvocation.execute(signal, liveOutput, shellConfig, setPidCallback):
   │   ├─ Check signal.aborted
   │   ├─ Create temp file for PID tracking
   │   ├─ Setup inactivity timeout
   │   ├─ Resolve cwd from config targetDir
   │   ├─ validatePathAccess(cwd)
   │   ├─ For Unix: wrap command with pgrep tracking
   │   │
   │   ├─ ShellExecutionService.execute(command, cwd, eventHandler):
   │   │   Events:
   │   │   ├─ 'data' → accumulate output + liveOutput callback
   │   │   ├─ 'binary_detected' → halt with binary message
   │   │   ├─ 'exit' → resolve with exit code
   │   │   └─ setPidCallback(process.pid)
   │   │
   │   ├─ If is_background: ShellExecutionService.background(pid)
   │   ├─ Read background PIDs from temp file
   │   │
   │   └─ Return ToolResult {
   │        llmContent: "Exit code: 0\nOutput:\n...",
   │        returnDisplay: AnsiOutput of command output,
   │        error: undefined (success)
   │      }
   │
   └─ AfterTool hook → (no modification)

10. ToolExecutor:
    ├─ signal.aborted? No
    ├─ result.error? No
    └─ createSuccessResult(call, toolResult)
       ├─ Check truncation threshold
       ├─ Create FunctionResponse
       └─ Return SuccessfulToolCall

11. CoreToolScheduler.checkAndNotifyCompletion():
    ├─ Move to completedToolCallsForBatch
    ├─ logToolCall(call)
    ├─ toolCallQueue empty → finalize batch
    └─ onAllToolCallsComplete([successfulCall])

12. onAllToolCallsComplete callback:
    ├─ Build Content { role: 'user', parts: [{ functionResponse: { name: "shell", response: {...} } }] }
    ├─ Add to chat history
    └─ Recursive sendMessageStream() → model sees tool result → continues
```

---

## 9. Built-in Tool Inventory

### Core Tools

| Tool | Name | Kind | Can Update Output | Requires Confirmation |
|------|------|------|-------------------|----------------------|
| **ReadFile** | `read_file` | Read | No | No (read-only) |
| **WriteFile** | `write_file` | Edit | No | Yes (shows diff) |
| **Edit** | `edit` | Edit | No | Yes (shows diff) |
| **Shell** | `shell` | Execute | Yes (streaming) | Yes (shows command) |
| **Grep** | `grep` | Search | No | No (read-only) |
| **RipGrep** | `ripGrep` | Search | No | No (read-only) |
| **Glob** | `glob` | Search | No | No (read-only) |
| **Ls** | `ls` | Read | No | No (read-only) |
| **WebFetch** | `web_fetch` | Fetch | No | Yes (network) |
| **WebSearch** | `web_search` | Fetch | No | Yes (network) |
| **Memory** | `memory` | Other | No | No |

### MCP Tools

| Component | File | Purpose |
|-----------|------|---------|
| `McpClient` | `tools/mcp-client.ts` | MCP protocol client management |
| `McpTool` | `tools/mcp-tool.ts` | Wrapper for MCP server tools |

MCP tools are registered dynamically when MCP servers connect. They use fully qualified names: `serverName__toolName`.

### Discovered Tools

External tools discovered via config-specified command. Each creates a `DiscoveredTool` that spawns a subprocess for execution, communicating via JSON over stdin/stdout.

---

## 10. Scheduler Types

**File:** `packages/core/src/scheduler/types.ts`

### ToolCallRequestInfo

```typescript
interface ToolCallRequestInfo {
  callId: string;                     // Unique identifier (from model or generated)
  name: string;                       // Tool name
  args: Record<string, unknown>;      // Tool parameters
  isClientInitiated: boolean;         // Origin flag
  prompt_id: string;                  // Associated prompt
  checkpoint?: string;                // Checkpoint reference
  traceId?: string;                   // Request trace ID
  parentCallId?: string;              // Parent call in hierarchy
  schedulerId?: string;               // Scheduler instance
}
```

### ToolCallResponseInfo

```typescript
interface ToolCallResponseInfo {
  callId: string;                               // Matches request
  responseParts: Part[];                        // @google/genai Parts
  resultDisplay: ToolResultDisplay | undefined; // User display
  error: Error | undefined;                     // Error if failed
  errorType: ToolErrorType | undefined;         // Error classification
  outputFile?: string;                          // Truncated output file
  contentLength?: number;                       // Response size
  data?: Record<string, unknown>;               // Structured data
}
```

### ToolCall Union Type

```typescript
type ToolCall =
  | ValidatingToolCall      // { status: 'validating', request, tool, invocation, startTime?, outcome? }
  | ScheduledToolCall       // { status: 'scheduled', request, tool, invocation, startTime?, outcome? }
  | WaitingToolCall         // { status: 'awaiting_approval', + confirmationDetails, correlationId? }
  | ExecutingToolCall       // { status: 'executing', + liveOutput?, pid? }
  | SuccessfulToolCall      // { status: 'success', + response, durationMs? }
  | ErroredToolCall         // { status: 'error', + response, durationMs?, tool? }
  | CancelledToolCall       // { status: 'cancelled', + response, durationMs? }

type CompletedToolCall = SuccessfulToolCall | ErroredToolCall | CancelledToolCall;
```

### Callback Types

```typescript
type OutputUpdateHandler = (callId: string, chunk: string | AnsiOutput) => void;
type AllToolCallsCompleteHandler = (completed: CompletedToolCall[]) => Promise<void>;
type ToolCallsUpdateHandler = (toolCalls: ToolCall[]) => void;
```

---

## 11. Tool Results & Confirmation System

### ToolCallConfirmationDetails (Union Type)

```typescript
type ToolCallConfirmationDetails =
  | ToolEditConfirmationDetails        // File edit with diff preview
  | ToolExecuteConfirmationDetails     // Shell command with command preview
  | ToolMcpConfirmationDetails         // MCP tool call
  | ToolInfoConfirmationDetails        // Generic info confirmation
  | ToolAskUserConfirmationDetails     // Ask user question
  | ToolExitPlanModeConfirmationDetails // Exit plan mode

// Common fields:
{
  type: 'edit' | 'exec' | 'mcp' | 'info' | 'ask_user' | 'exit_plan_mode';
  title: string;
  onConfirm: (outcome: ToolConfirmationOutcome, payload?) => Promise<void>;
}
```

### ToolEditConfirmationDetails

```typescript
{
  type: 'edit';
  title: string;
  filePath: string;
  diff: FileDiff;           // Before/after content
  isNewFile: boolean;
  onConfirm: Function;
}
```

### ToolExecuteConfirmationDetails

```typescript
{
  type: 'exec';
  title: string;
  command: string;          // Full command
  rootCommand: string;      // Display name of root command
  rootCommands: string[];   // All root commands
  onConfirm: Function;
}
```

### Policy Update on Approval

When user chooses `ProceedAlways` or `ProceedAlwaysAndSave`:

```
publishPolicyUpdate(outcome)
  ├─ Create UPDATE_POLICY message
  ├─ Include getPolicyUpdateOptions(outcome):
  │   Shell tools: { commandPrefix: ["npm", "git", ...] }
  │   MCP tools: { mcpName: "serverName__toolName" }
  └─ Publish to message bus → PolicyEngine updates rules
```

This allows the session to remember approvals for specific commands or tool types.

---

## 12. Confirmation Bus (Message Bus)

**File:** `packages/core/src/confirmation-bus/message-bus.ts`

The confirmation bus is the **communication layer** between the tool scheduler and the UI/policy system.

### Message Types

```typescript
enum MessageBusType {
  TOOL_CONFIRMATION_REQUEST,   // Scheduler → UI: "Should this tool run?"
  TOOL_CONFIRMATION_RESPONSE,  // UI → Scheduler: "Yes/No"
  TOOL_POLICY_REJECTION,       // Policy → Scheduler: "Denied by policy"
  UPDATE_POLICY,               // Scheduler → Policy: "Remember this approval"
}
```

### Request-Response Pattern

```
CoreToolScheduler                 MessageBus                    UI / PolicyEngine
       │                              │                              │
       ├─ publish(TOOL_CONFIRMATION)──►│                              │
       │                              ├─ PolicyEngine.evaluate()────►│
       │                              │◄──── ALLOW/DENY/ASK_USER ───┤
       │                              │                              │
       │  (if ASK_USER)               │                              │
       │                              ├─ Forward to UI ─────────────►│
       │                              │                              │ User decides
       │                              │◄──── TOOL_CONFIRMATION_RESP──┤
       │◄─ response (correlationId)───┤                              │
       │                              │                              │
       │  (if ProceedAlways)          │                              │
       ├─ publish(UPDATE_POLICY)─────►│                              │
       │                              ├─ PolicyEngine.addRule()─────►│
```

### Key Methods

```typescript
class MessageBus {
  publish(type, payload): void
    // Fire-and-forget event publishing

  subscribe(type, handler): void
    // Register event listener

  request(type, payload, timeout=60s): Promise<Response>
    // Request-response with correlation ID and timeout
    // Used for tool confirmation flow
}
```

### Correlation ID Flow

Each tool confirmation request generates a unique `correlationId`. The response must include the matching ID. This prevents race conditions when multiple tools are queued.

---

## 13. Safety Checker System

**File:** `packages/core/src/safety/`

The safety system provides an extensible framework for validating tool calls before execution.

### Checker Runner

**File:** `packages/core/src/safety/checker-runner.ts`

```typescript
class CheckerRunner {
  async runChecker(checkerName, context): Promise<SafetyCheckDecision>
    // Routes to appropriate checker implementation
    // In-process checkers: direct function call
    // External checkers: spawn child process with stdin/stdout
    // Timeout: 5 seconds per check
    // Validates result against SafetyCheckDecision schema
}
```

### Checker Registry

**File:** `packages/core/src/safety/registry.ts`

```typescript
class CheckerRegistry {
  resolve(name): CheckerImplementation
    // Resolves checker name to implementation
    // Built-in: AllowedPathChecker
    // External: file path resolution for custom checkers
    // Name validation: /^[a-z0-9-]+$/
}
```

### Built-in Checker: AllowedPathChecker

**File:** `packages/core/src/safety/built-in.ts`

Validates that tool calls only access allowed file system paths. Configured via policy rules.

### Context Builder

**File:** `packages/core/src/safety/context-builder.ts`

Builds structured context for safety checkers including:
- Tool name and arguments
- Current policy state
- Workspace boundaries

---

## 14. Discovered Tool Isolation

**File:** `packages/core/src/tools/tool-registry.ts` (DiscoveredToolInvocation section)

Discovered tools (external, non-built-in) execute in isolated subprocesses:

```
DiscoveredToolInvocation.execute()
  ├─ Spawn child process for the discovered tool
  ├─ Communicate via JSON over stdin/stdout
  ├─ Timeout handling
  ├─ Error stream capture (stderr)
  └─ Result parsing and validation
```

This ensures external tools can't access the main process memory or internal state.

---

## 15. Agent Tools (Subagent Integration)

### Subagent Tool Wrapper

**File:** `packages/core/src/agents/subagent-tool-wrapper.ts`

Wraps agent invocations as standard tools so agents can be called by the model just like any other tool:

```
Model calls: functionCall { name: "codebase_investigator", args: { query: "..." } }
  │
  └─ SubagentToolWrapper creates a local agent execution:
      ├─ LocalAgentExecutor with isolated tool registry
      ├─ Agent-specific system prompt
      ├─ Restricted tool set
      └─ Returns structured output as functionResponse
```

### Agent-Specific Tool Registry Isolation

When a sub-agent executes, it gets a **filtered tool registry** that:
- Removes the agent tool itself (prevents recursive self-invocation)
- May restrict to a subset of tools defined in the agent config
- Supports MCP tool namespace validation

---

## 16. Environment Sanitization for Shell Tools

**File:** `packages/core/src/services/environmentSanitization.ts`

Before shell commands execute, environment variables are sanitized:

- Filters sensitive variables (API keys, tokens, secrets)
- Whitelist-based approach
- Prevents accidental credential exposure in shell output
- Applied via `ShellExecutionService` before process spawn
