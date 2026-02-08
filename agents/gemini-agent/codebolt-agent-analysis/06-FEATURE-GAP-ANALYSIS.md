# Gemini CLI → Codebolt Agent SDK — Feature Gap Analysis

> **Purpose:** Identify every Gemini CLI feature, categorize it as "provided by Codebolt," "requires custom code," or "not applicable," and detail the custom implementations needed.

---

## 1. Feature Coverage Matrix

### Legend
- **Built-in** — Codebolt SDK provides this out-of-the-box
- **Custom** — Must be implemented as a custom modifier/processor
- **Platform** — Handled by the Codebolt application (no agent code)
- **N/A** — Not applicable or not needed in Codebolt context
- **Partial** — Codebolt provides basic version; Gemini's is more advanced

| # | Gemini CLI Feature | Coverage | Codebolt Component | Effort |
|---|-------------------|----------|-------------------|--------|
| | **CORE LOOP** | | | |
| 1 | Agent loop (turn processing) | Built-in | `AgentStep` + `ResponseExecutor` loop | None |
| 2 | Max turns limiter (100) | Custom | Counter in while-loop | Trivial |
| 3 | Session turn limit | Custom | Counter with config | Trivial |
| 4 | Recursive tool result feeding | Built-in | `ResponseExecutor` loop continuation | None |
| 5 | Bounded turns exhaustion | Custom | Counter check | Trivial |
| | **PROMPT SYSTEM** | | | |
| 6 | Environment context (date, OS, CWD) | Built-in | `EnvironmentContextModifier` | None |
| 7 | Directory tree context | Built-in | `DirectoryContextModifier` | None |
| 8 | IDE context (active file, cursor, etc.) | Built-in | `IdeContextModifier` | None |
| 9 | Chat history management | Built-in | `ChatHistoryMessageModifier` | None |
| 10 | System prompt (15 sections, ~40KB) | **Custom** | `GeminiSystemPromptModifier` | HIGH |
| 11 | Template substitution engine | N/A | Not needed (Codebolt handles natively) | None |
| 12 | Conditional section control (env vars) | **Custom** | Config flags in prompt builder | LOW |
| 13 | Custom template override (GEMINI_SYSTEM_MD) | N/A | System prompt is in agent code | None |
| 14 | User memory (GEMINI.md) | **Custom** | `MemoryModifier` + `codebolt.memory` | MEDIUM |
| 15 | Environment memory (project GEMINI.md) | **Custom** | `MemoryModifier` + `codebolt.memory` | MEDIUM |
| 16 | @file mention processing | Built-in | `AtFileProcessorModifier` | None |
| 17 | Tool declarations injection | Built-in | `ToolInjectionModifier` | None |
| 18 | Dynamic prompt updates | Built-in | Modifiers run fresh each message | None |
| | **TOOL SYSTEM** | | | |
| 19 | Tool registry (register/lookup) | Built-in | MCP auto-discovery | None |
| 20 | Tool execution (MCP routing) | Built-in | `ResponseExecutor` | None |
| 21 | Tool scheduling (sequential queue) | Built-in | `ResponseExecutor` internal | None |
| 22 | Tool state machine (7 states) | Platform | Codebolt Application | None |
| 23 | Policy engine (ALLOW/DENY/ASK_USER) | Platform | Codebolt Application | None |
| 24 | Tool confirmation UI (diff, command preview) | Platform | Codebolt Application | None |
| 25 | User rejection propagation | Platform | `[didUserReject, result]` return | None |
| 26 | Shell tool (PTY, PID tracking) | Partial | `codebolt--executeCommand` | None* |
| 27 | File read tool | Built-in | `codebolt--readFile` | None |
| 28 | File write tool | Built-in | `codebolt--writeFile` | None |
| 29 | Edit tool (string replacement) | Built-in | `codebolt--editFile` | None |
| 30 | Grep/search tool | Built-in | `codebolt--searchFiles` | None |
| 31 | Glob tool | Built-in | `codebolt--listFiles` | None |
| 32 | Ls tool | Built-in | `codebolt--listFiles` | None |
| 33 | Web fetch tool | Partial | May need MCP server | LOW |
| 34 | Web search tool | Partial | May need MCP server | LOW |
| 35 | Memory tool (read/write) | **Custom** | `codebolt.memory` APIs or custom MCP | MEDIUM |
| 36 | Discovered tools (external) | N/A | MCP servers replace this | None |
| 37 | Tool output truncation | Partial | `ConversationCompactorModifier` | None |
| 38 | BeforeTool / AfterTool hooks | **Custom** | `PreToolCallProcessor` / `PostToolCallProcessor` | LOW |
| | **COMPRESSION** | | | |
| 39 | Token threshold check (50%) | Built-in | `ChatCompressionModifier` | None |
| 40 | History truncation (old outputs → 30 lines) | Built-in | `ConversationCompactorModifier` | None |
| 41 | LLM-based summarization | Built-in | `compactStrategy: 'smart'` | None |
| 42 | XML state_snapshot format | Partial | Smart compaction similar but not XML | LOW |
| 43 | Verification turn (self-correction) | N/A | Smart compaction handles internally | None |
| 44 | Preserve last 30% at full fidelity | Built-in | Part of smart compaction | None |
| | **SAFETY & RESILIENCE** | | | |
| 45 | Loop detection: tool call hash (5 identical) | **Custom** | `LoopDetectionProcessor` | MEDIUM |
| 46 | Loop detection: content chunk (50-char window) | **Custom** | `LoopDetectionProcessor` | MEDIUM |
| 47 | Loop detection: LLM-based (30+ turns) | **Custom** | Custom logic in loop | MEDIUM |
| 48 | Retry with exponential backoff | Partial | Basic retry built-in | LOW |
| 49 | Next speaker checker | **Custom** | `nextSpeakerChecker.ts` | MEDIUM |
| 50 | Invalid stream retry ("Please continue.") | Partial | Error handling in loop | LOW |
| 51 | Context window overflow check | Built-in | Compression handles this | None |
| 52 | Shell redirection detection | Platform | Platform security | None |
| 53 | Environment sanitization | Platform | Platform handles env vars | None |
| | **MODEL ROUTING** | | | |
| 54 | Composite routing strategy | **Custom** | `modelRouter.ts` | MEDIUM |
| 55 | Fallback strategy (availability) | **Custom** | Error handling with model switch | LOW |
| 56 | Override strategy (user-specified model) | N/A | Agent config specifies model | None |
| 57 | Classifier strategy (LLM-based) | **Custom** | LLM call to classify task | MEDIUM |
| 58 | Numerical classifier (score 1-100) | **Custom** | Score-based model selection | MEDIUM |
| 59 | Default strategy | Built-in | Default model in agent config | None |
| 60 | Model availability tracking | **Custom** | Track failures per model | LOW |
| | **EXTENSIBILITY** | | | |
| 61 | Hook system (6 hook points) | **Custom** | Processors at 4 stages | LOW |
| 62 | Skills system | Platform | Codebolt Skills | None |
| 63 | Agent registry (sub-agents) | Built-in | `codebolt.agent` APIs | None |
| 64 | A2A remote agents | Partial | Local agents only | LOW |
| | **SESSION** | | | |
| 65 | Session recording (JSON file) | **Custom** | `codebolt.state` / `codebolt.memory` | LOW |
| 66 | Session resumption | **Custom** | Load state on startup | LOW |
| 67 | Session summary (one-line) | **Custom** | LLM call at session end | LOW |
| | **OTHER** | | | |
| 68 | Plan mode (read-only tools) | **Custom** | `PlanModeModifier` + tool filtering | LOW |
| 69 | Sandbox awareness | **Custom** | Conditional prompt section | Trivial |
| 70 | Telemetry/logging | Partial | `enableLogging: true` + custom | LOW |
| 71 | Token estimation (heuristic) | Built-in | Framework handles | None |
| 72 | Dual history (comprehensive + curated) | Built-in | Framework manages internally | None |

---

## 2. Coverage Summary

| Category | Total Features | Built-in | Custom Required | Platform | N/A / Partial |
|----------|---------------|----------|-----------------|----------|---------------|
| Core Loop | 5 | 2 | 3 | 0 | 0 |
| Prompt System | 13 | 7 | 4 | 0 | 2 |
| Tool System | 20 | 10 | 2 | 5 | 3 |
| Compression | 6 | 4 | 0 | 0 | 2 |
| Safety & Resilience | 9 | 1 | 4 | 2 | 2 |
| Model Routing | 7 | 1 | 4 | 0 | 2 |
| Extensibility | 4 | 1 | 1 | 1 | 1 |
| Session | 3 | 0 | 3 | 0 | 0 |
| Other | 5 | 2 | 2 | 0 | 1 |
| **TOTAL** | **72** | **28 (39%)** | **23 (32%)** | **8 (11%)** | **13 (18%)** |

**Key Takeaway:** ~50% of Gemini CLI features are handled by Codebolt (built-in + platform). The remaining 32% that need custom code are mostly modifiers/processors — structured, well-defined extension points, not raw infrastructure.

---

## 3. Custom Implementation Details

### 3.1 HIGH Priority — System Prompt (Feature #10)

**What Gemini does:** 15 render functions producing ~40KB of system instructions across sections like preamble, core mandates, workflows, operational guidelines, git, sandbox, and final reminder.

**Codebolt implementation:**

```typescript
// src/prompt/sections/preamble.ts
export function renderPreamble(interactive: boolean): string {
  return interactive
    ? `You are an interactive CLI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.`
    : `You are a non-interactive CLI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.`;
}
```

```typescript
// src/prompt/sections/coreMandates.ts
export function renderCoreMandates(options: {
  interactive: boolean;
  hasSkills: boolean;
}): string {
  const mandates = [
    '1. Rigorously adhere to existing project conventions. Analyze surrounding code, tests, config first.',
    '2. NEVER assume library/framework availability. Verify by checking imports, config files, neighboring files.',
    '3. Mimic existing style (formatting, naming), structure, framework choices, typing, architectural patterns.',
    '4. Understand local context (imports, functions/classes) to ensure natural integration.',
    '5. Comments sparingly. Focus on *why*, not *what*. No explanatory comments in tool calls.',
    '6. Fulfill requests thoroughly. Include tests for features/bug fixes. Treat created files as permanent.',
  ];

  if (options.interactive) {
    mandates.push('7. Ask for confirmation before taking significant actions beyond scope.');
  } else {
    mandates.push('7. Do not take actions beyond scope. Complete task using best judgment.');
  }

  mandates.push("8. Don't provide summaries unless asked.");
  mandates.push("9. Don't revert changes unless asked. Only revert own changes if they caused errors.");

  if (options.hasSkills) {
    mandates.push('10. Once a skill is activated, treat <instructions> tags as expert guidance.');
  }

  return `# Core Mandates\n\n${mandates.join('\n')}`;
}
```

**Effort estimate:** ~600 lines across 7 section files. Straightforward text porting with Codebolt tool name substitutions.

### 3.2 HIGH Priority — Loop Detection (Features #45-47)

**What Gemini does:** Three independent detection methods:

1. **Tool call loop:** SHA256 hash of `name:args`, track consecutive identical, threshold = 5
2. **Content chunk loop:** Sliding window of 50-char chunks, SHA256 each, detect 10+ repetitions within avg distance ≤ 250 chars
3. **LLM-based loop:** After 30 turns, every 3 turns, query LLM "is this unproductive?" with confidence 0.9 threshold

**Codebolt implementation:**

```typescript
// src/processors/LoopDetectionProcessor.ts
export class LoopDetectionProcessor extends BasePreInferenceProcessor {
  // Method 1: Tool call hash tracking
  private lastToolCallHash = '';
  private consecutiveIdentical = 0;
  private static TOOL_CALL_THRESHOLD = 5;

  // Method 2: Content chunk tracking
  private contentHistory = '';
  private static CONTENT_CHUNK_SIZE = 50;
  private static CONTENT_LOOP_THRESHOLD = 10;
  private static MAX_HISTORY_LENGTH = 5000;

  // Method 3: LLM-based tracking
  private turnCount = 0;
  private static LLM_CHECK_AFTER_TURNS = 30;
  private static LLM_CHECK_INTERVAL = 3;

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    this.turnCount++;

    // Method 1: Check tool call loop
    const toolLoopDetected = this.checkToolCallLoop(createdMessage);

    // Method 2: Check content chunk loop
    const contentLoopDetected = this.checkContentLoop(createdMessage);

    // Method 3: LLM-based check (expensive, run periodically)
    let llmLoopDetected = false;
    if (this.turnCount >= LoopDetectionProcessor.LLM_CHECK_AFTER_TURNS &&
        this.turnCount % LoopDetectionProcessor.LLM_CHECK_INTERVAL === 0) {
      llmLoopDetected = await this.checkLLMLoop(createdMessage);
    }

    if (toolLoopDetected || contentLoopDetected || llmLoopDetected) {
      createdMessage.message.messages.push({
        role: 'system',
        content: `LOOP DETECTED: The conversation appears to be in an unproductive loop. ` +
          `Please try a completely different approach, ask the user for clarification, ` +
          `or use attempt_completion to report what you've found.`
      });
    }

    return createdMessage;
  }

  private checkToolCallLoop(msg: ProcessedMessage): boolean {
    // Extract last tool call from messages
    const messages = msg.message.messages;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as any;
      if (m.tool_calls && m.tool_calls.length > 0) {
        const tc = m.tool_calls[0];
        const hash = createHash('sha256')
          .update(`${tc.function.name}:${tc.function.arguments}`)
          .digest('hex');

        if (hash === this.lastToolCallHash) {
          this.consecutiveIdentical++;
          return this.consecutiveIdentical >= LoopDetectionProcessor.TOOL_CALL_THRESHOLD;
        } else {
          this.lastToolCallHash = hash;
          this.consecutiveIdentical = 1;
          return false;
        }
      }
    }
    return false;
  }

  private checkContentLoop(msg: ProcessedMessage): boolean {
    // Extract last assistant content
    const messages = msg.message.messages;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as any;
      if (m.role === 'assistant' && typeof m.content === 'string') {
        this.contentHistory += m.content;
        if (this.contentHistory.length > LoopDetectionProcessor.MAX_HISTORY_LENGTH) {
          this.contentHistory = this.contentHistory.slice(-LoopDetectionProcessor.MAX_HISTORY_LENGTH);
        }

        // Sliding window chunk analysis
        return this.analyzeContentChunks();
      }
    }
    return false;
  }

  private analyzeContentChunks(): boolean {
    const chunkSize = LoopDetectionProcessor.CONTENT_CHUNK_SIZE;
    const chunkHashes: Map<string, number[]> = new Map();

    for (let i = 0; i <= this.contentHistory.length - chunkSize; i += chunkSize) {
      const chunk = this.contentHistory.slice(i, i + chunkSize);
      const hash = createHash('sha256').update(chunk).digest('hex');

      if (!chunkHashes.has(hash)) {
        chunkHashes.set(hash, []);
      }
      chunkHashes.get(hash)!.push(i);
    }

    // Check for repetitive chunks
    for (const [, positions] of chunkHashes) {
      if (positions.length >= LoopDetectionProcessor.CONTENT_LOOP_THRESHOLD) {
        // Calculate average distance
        let totalDistance = 0;
        for (let i = 1; i < positions.length; i++) {
          totalDistance += positions[i] - positions[i - 1];
        }
        const avgDistance = totalDistance / (positions.length - 1);
        if (avgDistance <= 250) {
          return true;
        }
      }
    }

    return false;
  }

  private async checkLLMLoop(msg: ProcessedMessage): Promise<boolean> {
    try {
      const recentMessages = msg.message.messages.slice(-20);
      const analysis = await codebolt.llm.inference({
        messages: [
          {
            role: 'system',
            content: 'Analyze the conversation for unproductive patterns. ' +
              'Return JSON: { "unproductive": true/false, "confidence": 0.0-1.0, "reason": "..." }'
          },
          {
            role: 'user',
            content: JSON.stringify(recentMessages.map(m => ({
              role: (m as any).role,
              content: typeof (m as any).content === 'string'
                ? (m as any).content.slice(0, 500) : '[tool data]'
            })))
          }
        ]
      });

      const result = JSON.parse(
        analysis.completion?.choices?.[0]?.message?.content || '{}'
      );
      return result.unproductive === true && result.confidence >= 0.9;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.lastToolCallHash = '';
    this.consecutiveIdentical = 0;
    this.contentHistory = '';
    this.turnCount = 0;
  }
}
```

**Effort estimate:** ~200 lines. Requires crypto for SHA256 hashing.

### 3.3 MEDIUM Priority — Memory System (Features #14-15)

**What Gemini does:** Reads `~/.gemini/GEMINI.md` (user) and `<project>/GEMINI.md` (project) files, injects content into system instruction.

**Codebolt implementation:**

```typescript
// src/modifiers/MemoryModifier.ts
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import codebolt from '@codebolt/codeboltjs';

export class MemoryModifier extends BaseMessageModifier {
  async modify(originalRequest, createdMessage) {
    const userMemory = await this.loadMemory('user_preferences');
    const projectMemory = await this.loadMemory('project_context');

    if (userMemory || projectMemory) {
      let memorySection = '\n---\n\n';
      if (userMemory) memorySection += `${userMemory}\n\n`;
      if (projectMemory) memorySection += `${projectMemory}\n\n`;

      createdMessage.message.messages.push({
        role: 'system',
        content: memorySection
      });
    }

    return createdMessage;
  }

  private async loadMemory(key: string): Promise<string | null> {
    try {
      const data = await codebolt.memory.json.load(key);
      return data ? JSON.stringify(data, null, 2) : null;
    } catch {
      return null;
    }
  }
}
```

**Effort estimate:** ~50 lines.

### 3.4 MEDIUM Priority — Next Speaker Checker (Feature #49)

**What Gemini does:** After model completes a turn without tool calls, uses an LLM to decide if the model should continue speaking or yield to user. Fast-path returns for empty messages and function responses.

**Codebolt implementation:** See `05-IMPLEMENTATION-PLAN.md`, Section 4, Phase 4.

**Effort estimate:** ~60 lines.

### 3.5 MEDIUM Priority — Model Routing (Features #54-58)

**What Gemini does:** 5-strategy composite router (Fallback → Override → Classifier → Numerical → Default). Classifier uses LLM to decide FLASH vs PRO based on task complexity.

**Codebolt implementation:** If model routing is desired:

```typescript
// src/services/modelRouter.ts
export async function routeModel(
  userMessage: string,
  defaultModel: string
): Promise<string> {
  try {
    const analysis = await codebolt.llm.inference({
      messages: [
        {
          role: 'system',
          content: `Classify task complexity. Return "FLASH" for simple tasks (1-3 steps, specific, bounded) or "PRO" for complex tasks (4+ steps, strategic planning, high ambiguity, deep debugging). Return only the word.`
        },
        { role: 'user', content: userMessage }
      ]
    });

    const classification = analysis.completion?.choices?.[0]?.message?.content?.trim();
    if (classification === 'FLASH') {
      return 'gemini-2.5-flash'; // or equivalent fast model
    }
    return defaultModel; // PRO model
  } catch {
    return defaultModel;
  }
}
```

**Effort estimate:** ~50 lines for basic routing, ~150 for full composite strategy.

### 3.6 LOW Priority — Plan Mode (Feature #68)

**What Gemini does:** Read-only mode with 4-phase workflow. Restricts to read-only tools and changes system prompt to planning workflow.

**Codebolt implementation:**

```typescript
// src/modifiers/PlanModeModifier.ts
export class PlanModeModifier extends BaseMessageModifier {
  constructor(private isPlanMode: boolean) { super(); }

  async modify(originalRequest, createdMessage) {
    if (this.isPlanMode) {
      createdMessage.message.messages.push({
        role: 'system',
        content: PLAN_MODE_INSTRUCTIONS
      });
    }
    return createdMessage;
  }
}

// Restrict tools in plan mode:
const planModeTools = [
  'codebolt--readFile',
  'codebolt--listFiles',
  'codebolt--searchFiles',
  'codebolt--git_status',
  'codebolt--git_log'
];
```

**Effort estimate:** ~40 lines.

---

## 4. Features NOT Worth Replicating

| Gemini Feature | Why Skip |
|---------------|----------|
| **Config god object** (~1800 lines) | Codebolt handles config at platform level |
| **Authentication system** (OAuth, API key, Vertex) | Codebolt manages LLM credentials |
| **Sandbox management** (seatbelt, containers) | Codebolt platform handles workspace isolation |
| **Telemetry system** (45+ files, OpenTelemetry) | Codebolt has its own telemetry |
| **CLI UI** (Ink/React rendering) | Codebolt provides the UI |
| **ContentGenerator wrapper** | Codebolt's `AgentStep` handles LLM communication |
| **ChatRecordingService** (session JSON) | Codebolt manages session persistence |
| **Confirmation bus** (message bus for approvals) | Codebolt platform handles approvals |
| **IDE client** (WebSocket connection) | Codebolt provides IDE integration |
| **Extension system** | Codebolt has its own plugin system |
| **MCP OAuth/token storage** | Codebolt manages MCP server connections |
| **Code Assist integration** | Specific to Google's infrastructure |
| **Fallback model handling** (quota, 429) | Basic retry sufficient; complex fallback is Google-specific |

---

## 5. Effort Estimation Summary

| Priority | Features | Custom Lines | Time |
|----------|----------|-------------|------|
| **HIGH** | System prompt (15 sections) | ~600 | 1-2 days |
| **HIGH** | Loop detection (3 methods) | ~200 | 0.5-1 day |
| **MEDIUM** | Memory system | ~50 | 0.5 day |
| **MEDIUM** | Next speaker checker | ~60 | 0.5 day |
| **MEDIUM** | Model routing | ~150 | 0.5-1 day |
| **LOW** | Plan mode | ~40 | 0.25 day |
| **LOW** | Session recording | ~80 | 0.5 day |
| **LOW** | Custom tool hooks (pre/post) | ~100 | 0.5 day |
| **LOW** | Sandbox awareness prompt | ~20 | Trivial |
| **TOTAL** | 23 custom features | **~1,300 lines** | **~5-7 days** |

---

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Codebolt tool names differ from Gemini | System prompt must reference correct tool names | Create tool name mapping (`toolNameMap.ts`) |
| `ResponseExecutor` routing doesn't match all tools | Some tools may not exist as MCP tools | Use `PreToolCallProcessor` for custom tools |
| Compression behavior differs from Gemini's XML format | Different summary format | Smart compaction is functionally equivalent |
| Loop detection may have false positives | Agent stops prematurely | Tune thresholds; start conservative |
| Next speaker checker adds latency (extra LLM call) | Slower turn completion | Use fast-path returns; only LLM for ambiguous cases |
| Model routing may not have equivalent fast/pro models | Different model behavior | Map to available models; make configurable |

---

## 7. Conclusion

Building a Gemini CLI equivalent on Codebolt Agent SDK is **highly feasible**:

- **39% of features** are provided out-of-the-box by the SDK
- **11% of features** are handled by the Codebolt platform (permissions, UI, security)
- **32% of features** need custom code, but all fit cleanly into the modifier/processor extension points
- **18% of features** are either not applicable or partially covered

The custom code (~1,300 lines) is **~10x smaller** than Gemini CLI's core (~15,000+ lines), demonstrating the significant abstraction benefit of the Codebolt Agent SDK.

The recommended approach is **incremental**: start with Phase 1 (core loop + basic prompt), verify it works, then layer on Gemini-specific features phase by phase.
