# Gemini CLI Agent Loop → Codebolt Agent Loop Mapping

> **Purpose:** Detailed trace of how the Gemini CLI agent loop maps step-by-step to the Codebolt Level 2 agentic loop, including all edge cases and recursive patterns.

---

## 1. Gemini CLI Agent Loop (Source)

The Gemini CLI runs a **recursive turn-processing loop** with the following flow:

```
User Message
  → sendMessageStream()
    → processTurn()
      → [compression check]
      → [context window check]
      → [IDE context injection]
      → [loop detection]
      → [model routing]
      → Turn.run()
        → GeminiChat.sendMessageStream()
          → makeApiCallAndProcessStream()
            → GoogleGenAI SDK call
      → [stream processing: text, tool calls, thoughts]
      → [tool execution via CoreToolScheduler]
      → [tool results → recursive sendMessageStream()]
    → [next speaker check → continue or return to user]
  → AfterAgent hook
```

### Key Control Flows

1. **Tool recursion**: After tool execution, results are fed back via recursive `sendMessageStream()` — the model sees tool results and continues.
2. **Next speaker**: After a turn without tool calls, an LLM check determines if the model should continue speaking.
3. **Max turns**: Bounded to 100 turns per message. Session-level turn limit is configurable.
4. **Compression**: Triggered when token count > 50% of model limit.
5. **Loop detection**: Checked pre-turn and during streaming.
6. **Invalid stream retry**: On malformed response, inject "System: Please continue." and retry.

---

## 2. Codebolt Level 2 Agent Loop (Target)

The Codebolt Level 2 loop uses three composable components:

```
User Message (via codebolt.onMessage)
  → InitialPromptGenerator.processMessage()
    → [All modifiers run sequentially]
  → LOOP:
    → AgentStep.executeStep()
      → [PreInferenceProcessors]
      → [LLM call]
      → [PostInferenceProcessors]
    → ResponseExecutor.executeResponse()
      → [PreToolCallProcessors]
      → [Tool execution (automatic MCP routing)]
      → [PostToolCallProcessors]
      → Returns { completed, nextMessage }
    → If !completed → continue loop
```

---

## 3. Step-by-Step Mapping

### 3.1 Entry Point: User Message Receipt

**Gemini CLI:**
```
CLI renders input → GeminiClient.sendMessageStream(request, signal, prompt_id)
  ├─ Reset loop detector if new prompt_id
  ├─ Fire BeforeAgent hook
  └─ processTurn(request, signal, prompt_id, boundedTurns=100)
```

**Codebolt Equivalent:**
```typescript
import codebolt from '@codebolt/codeboltjs';
import { InitialPromptGenerator, AgentStep, ResponseExecutor } from '@codebolt/agent/unified';
import { FlatUserMessage } from '@codebolt/types/sdk';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  // Reset loop state (custom)
  loopDetector.reset();

  // BeforeAgent hook equivalent: custom pre-processing
  const shouldContinue = await beforeAgentCheck(reqMessage);
  if (!shouldContinue) return;

  // Process message → initial prompt
  let prompt = await promptGenerator.processMessage(reqMessage);

  // Bounded turns (Gemini: MAX_TURNS=100)
  const MAX_TURNS = 100;
  let turnsRemaining = MAX_TURNS;
  let completed = false;

  // Agent loop
  while (!completed && turnsRemaining > 0) {
    // ... (see 3.3 below)
    turnsRemaining--;
  }

  // AfterAgent hook equivalent: custom post-processing
  await afterAgentCheck(reqMessage);
});
```

### 3.2 Initial Prompt Construction

**Gemini CLI:**
```
GeminiClient.startChat()
  ├─ tools = toolRegistry.getFunctionDeclarations()         // Stage C
  ├─ history = getInitialChatHistory(config, extraHistory)  // Stage A
  ├─ systemMemory = config.getUserMemory()
  ├─ systemInstruction = getCoreSystemPrompt(config, mem)   // Stage B
  └─ return new GeminiChat(systemInstruction, tools, history)
```

**Codebolt Equivalent:**
```typescript
const promptGenerator = new InitialPromptGenerator({
  processors: [
    // Stage A: History + Environment
    new ChatHistoryMessageModifier({ enableChatHistory: true }),
    new EnvironmentContextModifier({ enableFullContext: true }),
    new DirectoryContextModifier(),
    new IdeContextModifier({
      includeActiveFile: true,
      includeOpenFiles: true,
      includeCursorPosition: true,
      includeSelectedText: true
    }),

    // Stage B: System Instruction (Gemini's 15-section prompt)
    new CoreSystemPromptModifier({ customSystemPrompt: geminiSystemPrompt }),
    // Custom: User memory (GEMINI.md equivalent)
    new MemoryModifier(),

    // Stage C: Tool Declarations
    new ToolInjectionModifier({ includeToolDescriptions: true }),

    // Additional: @file processing
    new AtFileProcessorModifier({ enableRecursiveSearch: true })
  ],
  baseSystemPrompt: geminiSystemPrompt
});
```

### 3.3 Single Turn Execution (processTurn)

**Gemini CLI processTurn() sequence:**
```
1. Session turn limit check → yield MaxSessionTurns if exceeded
2. Bounded turns check → return if 0
3. tryCompressChat() → compress if > 50% token limit
4. Context window overflow check
5. IDE context injection (first turn: full, subsequent: delta)
6. Loop detection (pre-turn)
7. Model routing → select model
8. Turn.run() → LLM call
9. Process streamed events (text, tool calls, thoughts)
10. Invalid stream handling → retry with "Please continue."
11. Next speaker check → recursive call if model should continue
```

**Codebolt Equivalent:**
```typescript
while (!completed && turnsRemaining > 0) {
  // Steps 1-2: Turn limits
  if (turnsRemaining <= 0) break;
  if (sessionTurns >= maxSessionTurns) {
    codebolt.chat.sendMessage('Maximum session turns reached.', {});
    break;
  }

  // Steps 3-4: Compression handled by ChatCompressionModifier (pre-inference)
  // Step 5: IDE context handled by IdeContextModifier (already in prompt)
  // Step 6: Loop detection handled by custom LoopDetectionProcessor (pre-inference)

  // Step 7: Model routing (custom, before step execution)
  // const selectedModel = await routeModel(reqMessage, prompt);

  // Steps 8-9: LLM Call + Stream Processing
  const agentStep = new AgentStep({
    preInferenceProcessors: [
      new ChatCompressionModifier({ enableCompression: true }),
      // Custom loop detection
      new LoopDetectionProcessor({
        toolCallThreshold: 5,
        contentChunkThreshold: 10,
        llmCheckAfterTurns: 30
      })
    ],
    postInferenceProcessors: []
  });

  const stepResult = await agentStep.executeStep(reqMessage, prompt);
  prompt = stepResult.nextMessage;

  // Tool Execution (replaces CoreToolScheduler)
  const responseExecutor = new ResponseExecutor({
    preToolCallProcessors: [],
    postToolCallProcessors: [
      new ConversationCompactorModifier({
        compactStrategy: 'smart',
        compressionTokenThreshold: 0.5
      })
    ]
  });

  const executionResult = await responseExecutor.executeResponse({
    initialUserMessage: reqMessage,
    actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
    rawLLMOutput: stepResult.rawLLMResponse,
    nextMessage: stepResult.nextMessage
  });

  completed = executionResult.completed;
  prompt = executionResult.nextMessage;

  // Step 11: Next speaker check (custom, post-turn)
  if (completed) {
    const shouldContinue = await checkNextSpeaker(prompt);
    if (shouldContinue) {
      completed = false; // Force another turn
    }
  }

  turnsRemaining--;
  sessionTurns++;
}
```

### 3.4 Tool Execution Flow

**Gemini CLI:**
```
Turn.run() yields ToolCallRequest events
  → CoreToolScheduler.schedule(toolCalls[])
    → _schedule(): registry lookup + invocation build + policy check
    → _processNextInQueue(): sequential, one-at-a-time
    → attemptExecutionOfScheduledCalls()
      → ToolExecutor.execute()
        → executeToolWithHooks()
          → BeforeTool hook → invocation.execute() → AfterTool hook
    → onAllToolCallsComplete()
      → Build functionResponse
      → Add to history
      → Recursive sendMessageStream() with results
```

**Codebolt Equivalent:**
```
ResponseExecutor.executeResponse()
  ├─ Parses rawLLMOutput for tool_calls
  ├─ Routes based on naming convention:
  │   ├─ "codebolt--readFile" → codebolt.mcp.executeTool('codebolt', 'readFile', args)
  │   ├─ "codebolt--writeFile" → codebolt.mcp.executeTool('codebolt', 'writeFile', args)
  │   ├─ "codebolt--executeCommand" → codebolt.mcp.executeTool('codebolt', 'executeCommand', args)
  │   ├─ "subagent--name" → codebolt.agent.startAgent(name, task)
  │   └─ "attempt_completion" → marks completed = true
  ├─ Runs PreToolCallProcessors
  ├─ Executes tools (with Codebolt platform handling permissions)
  ├─ Runs PostToolCallProcessors
  ├─ Returns { completed, nextMessage } with tool results in history
  └─ If not completed → loop continues (equivalent to recursive sendMessageStream)
```

**Key Difference:** Codebolt's `ResponseExecutor` handles all tool routing automatically. No need to implement a state machine or scheduler. The Codebolt application handles permissions, confirmations, and approval UI — the agent code never deals with ALLOW/DENY/ASK_USER decisions.

---

## 4. Gemini Control Flow → Codebolt Processor Mapping

### 4.1 Compression

| Gemini | Codebolt | Mapping |
|--------|----------|---------|
| `tryCompressChat()` in `processTurn()` (pre-turn) | `ChatCompressionModifier` as PreInferenceProcessor | Direct. Both check token threshold before LLM call. |
| `DEFAULT_COMPRESSION_TOKEN_THRESHOLD = 0.5` | `compressionTokenThreshold: 0.5` in ConversationCompactorModifier | Same threshold. |
| `COMPRESSION_PRESERVE_THRESHOLD = 0.3` | Built into `compactStrategy: 'smart'` | Similar preservation logic. |
| `truncateHistoryToBudget()` (old tool outputs → 30 lines) | Part of smart compaction | Automatic. |
| LLM-based summarization with XML `<state_snapshot>` | ConversationCompactorModifier handles internally | Framework handles compression strategy. |

### 4.2 Loop Detection

| Gemini Method | Codebolt Implementation | Details |
|--------------|------------------------|---------|
| Tool call loop (SHA256 hash, 5 consecutive identical) | Custom `LoopDetectionProcessor` (PreInference) | Must implement: track tool call hashes, count consecutive identical |
| Content chunk loop (50-char sliding window, 10 repetitions) | Custom `LoopDetectionProcessor` (PreInference) | Must implement: streaming content analysis |
| LLM-based loop (after 30 turns, confidence 0.9) | Custom logic in agent loop | Must implement: periodic LLM query "is this unproductive?" |

### 4.3 Model Routing

| Gemini Strategy | Codebolt Implementation | Details |
|----------------|------------------------|---------|
| FallbackStrategy | Error handling around `AgentStep.executeStep()` | Catch errors, switch model |
| OverrideStrategy | Model parameter in LLM config | Direct model specification |
| ClassifierStrategy (LLM-based) | Custom pre-loop logic | LLM call to classify task complexity |
| NumericalClassifierStrategy | Custom pre-loop logic | Score-based model selection |
| DefaultStrategy | Default model in config | Fallback model |

### 4.4 Hook Points → Processor Mapping

| Gemini Hook | Codebolt Processor | When |
|-------------|-------------------|------|
| BeforeAgent | Custom logic before `promptGenerator.processMessage()` | Before initial prompt |
| AfterAgent | Custom logic after loop completes | After all turns done |
| BeforeModel | `BasePreInferenceProcessor` | Before each LLM call |
| BeforeToolSelection | Part of `ToolInjectionModifier` customization | During prompt build |
| BeforeTool | `BasePreToolCallProcessor` | Before each tool execution |
| AfterTool | `BasePostToolCallProcessor` | After each tool execution |

---

## 5. Recursive Pattern Comparison

### Gemini CLI: Recursive sendMessageStream

```
sendMessageStream("Fix bug")
  → processTurn() → Turn.run() → model says "call read_file"
    → tool executes → result appended to history
    → RECURSIVE: sendMessageStream("", turns-1)
      → processTurn() → Turn.run() → model says "call edit"
        → tool executes → result appended
        → RECURSIVE: sendMessageStream("", turns-2)
          → processTurn() → Turn.run() → model says "Done!"
          → nextSpeakerCheck() → "user" → return
```

### Codebolt: Iterative while-loop

```
prompt = promptGenerator.processMessage(msg)
LOOP:
  step = agentStep.executeStep(msg, prompt)     → model says "call read_file"
  exec = responseExecutor.executeResponse(step) → tool executes, adds to history
  completed = false → CONTINUE

  step = agentStep.executeStep(msg, prompt)     → model says "call edit"
  exec = responseExecutor.executeResponse(step) → tool executes, adds to history
  completed = false → CONTINUE

  step = agentStep.executeStep(msg, prompt)     → model says "Done!"
  exec = responseExecutor.executeResponse(step) → attempt_completion detected
  completed = true → EXIT LOOP
```

**Both achieve the same result.** Gemini uses recursion; Codebolt uses iteration. The iterative pattern is simpler and avoids stack depth issues.

---

## 6. Event System Comparison

### Gemini CLI Events (GeminiEventType)

| Event | Codebolt Handling | Notes |
|-------|------------------|-------|
| `Content` | `codebolt.chat.sendMessage()` for text output | Streaming text to user |
| `ToolCallRequest` | Internal to `ResponseExecutor` | Automatic tool routing |
| `ToolCallResponse` | Internal to `ResponseExecutor` | Result added to history |
| `ToolCallConfirmation` | **Codebolt Application** handles | No agent code needed |
| `UserCancelled` | AbortSignal / message handling | Platform-level |
| `Error` | try/catch in agent loop | Error handling |
| `ChatCompressed` | `ChatCompressionModifier` internal event | Automatic |
| `Thought` | Part of LLM response processing | If supported by model |
| `MaxSessionTurns` | Custom counter in agent loop | Simple counter check |
| `Finished` | `executionResult.completed === true` | Built into ResponseExecutor |
| `LoopDetected` | Custom `LoopDetectionProcessor` | Must implement |
| `Retry` | Error handling wrapper | Retry logic around AgentStep |
| `ContextWindowWillOverflow` | Compression handling | Pre-inference processor |
| `ModelInfo` | Model selection logging | Custom logging |

---

## 7. Complete Codebolt Agent Loop (Pseudocode)

```typescript
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator, AgentStep, ResponseExecutor
} from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier, EnvironmentContextModifier,
  DirectoryContextModifier, IdeContextModifier,
  CoreSystemPromptModifier, ToolInjectionModifier,
  AtFileProcessorModifier, ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { ProcessedMessage, AgentStepOutput } from '@codebolt/types/agent';

// --- Configuration ---
const MAX_TURNS = 100;
const GEMINI_SYSTEM_PROMPT = buildGeminiSystemPrompt(); // See 03-PROMPT-SYSTEM-MAPPING.md

// --- Custom Processors ---
// (See 06-FEATURE-GAP-ANALYSIS.md for implementations)

// --- Entry Point ---
codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  try {
    // === PHASE 1: Initial Prompt (replaces startChat + getInitialChatHistory) ===
    const promptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        new IdeContextModifier({
          includeActiveFile: true, includeOpenFiles: true,
          includeCursorPosition: true, includeSelectedText: true
        }),
        new CoreSystemPromptModifier({ customSystemPrompt: GEMINI_SYSTEM_PROMPT }),
        new ToolInjectionModifier({ includeToolDescriptions: true }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true })
      ],
      baseSystemPrompt: GEMINI_SYSTEM_PROMPT
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;
    let turnsRemaining = MAX_TURNS;

    // === PHASE 2: Agent Loop (replaces sendMessageStream + processTurn) ===
    while (!completed && turnsRemaining > 0) {

      // --- AgentStep: LLM Call (replaces Turn.run + GeminiChat.sendMessageStream) ---
      const agentStep = new AgentStep({
        preInferenceProcessors: [
          new ChatCompressionModifier({ enableCompression: true })
          // Add: LoopDetectionProcessor (custom)
        ],
        postInferenceProcessors: []
      });

      const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
      prompt = stepResult.nextMessage;

      // --- ResponseExecutor: Tool Execution (replaces CoreToolScheduler) ---
      const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: [
          new ConversationCompactorModifier({
            compactStrategy: 'smart',
            compressionTokenThreshold: 0.5
          })
        ]
      });

      const executionResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
        rawLLMOutput: stepResult.rawLLMResponse,
        nextMessage: stepResult.nextMessage
      });

      completed = executionResult.completed;
      prompt = executionResult.nextMessage;
      turnsRemaining--;
    }

  } catch (error) {
    console.error('Agent error:', error);
    codebolt.chat.sendMessage(`Error: ${error}`, {});
  }
});
```

---

## 8. Key Behavioral Differences

| Behavior | Gemini CLI | Codebolt Agent |
|----------|-----------|----------------|
| **Tool execution** | Sequential, one-at-a-time via state machine | Automatic via ResponseExecutor (handles batches) |
| **Permission checking** | PolicyEngine in agent code | Platform handles externally |
| **Model selection** | Complex routing with classifier LLM | Configured per agent (can add custom routing) |
| **Streaming** | Full streaming via AsyncGenerator events | LLM response handled by AgentStep internally |
| **Retry on failure** | Exponential backoff with jitter | Framework handles basic retry; custom for advanced |
| **History format** | Google `Content[]` with roles | Codebolt `ProcessedMessage` format (OpenAI-compatible messages) |
| **Next speaker** | LLM check after each turn | Must implement as custom logic |
| **IDE context updates** | Delta-based (first: full, then: changes) | `IdeContextModifier` handles automatically |
