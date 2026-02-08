# Gemini CLI Clone — Codebolt Implementation Plan

> **Purpose:** Step-by-step blueprint for building a Gemini CLI equivalent using Codebolt Agent SDK v2, Level 2 (Base Components) with Level 1 augmentation.

---

## 1. Project Structure

```
gemini-codebolt-agent/
├── codeboltagent.yaml              # Agent configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── webpack.config.js               # Build config
├── src/
│   ├── index.ts                    # Entry point: codebolt.onMessage() handler
│   ├── config.ts                   # Agent configuration constants
│   │
│   ├── prompt/
│   │   ├── systemPrompt.ts         # Gemini-style system prompt builder (15 sections)
│   │   ├── sections/
│   │   │   ├── preamble.ts         # renderPreamble()
│   │   │   ├── coreMandates.ts     # renderCoreMandates()
│   │   │   ├── workflows.ts        # renderPrimaryWorkflows() + renderPlanningWorkflow()
│   │   │   ├── guidelines.ts       # renderOperationalGuidelines()
│   │   │   ├── gitRepo.ts          # renderGitRepo()
│   │   │   ├── sandbox.ts          # renderSandbox()
│   │   │   └── finalReminder.ts    # renderFinalReminder()
│   │   └── toolNameMap.ts          # Gemini→Codebolt tool name mapping
│   │
│   ├── modifiers/
│   │   ├── GeminiSystemPromptModifier.ts  # Custom system prompt modifier
│   │   ├── MemoryModifier.ts              # User/project memory (GEMINI.md equivalent)
│   │   └── PlanModeModifier.ts            # Plan mode tool restriction
│   │
│   ├── processors/
│   │   ├── LoopDetectionProcessor.ts      # 3-method loop detection
│   │   ├── SessionRecordingProcessor.ts   # Session persistence (optional)
│   │   └── ErrorCheckProcessor.ts         # Critical error detection
│   │
│   ├── services/
│   │   ├── nextSpeakerChecker.ts          # Continue-or-return-to-user logic
│   │   ├── modelRouter.ts                 # Model routing (auto/pro/flash)
│   │   └── memoryService.ts               # Memory read/write operations
│   │
│   └── utils/
│       ├── tokenEstimation.ts             # Token counting helpers
│       └── loopDetection.ts               # Hash + sliding window logic
│
└── dist/                                   # Compiled output
```

---

## 2. Dependencies

```json
{
  "name": "gemini-codebolt-agent",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "npx webpack",
    "dev": "npx tsx src/index.ts",
    "typecheck": "npx tsc --noEmit",
    "lint": "npx eslint src/"
  },
  "dependencies": {
    "@codebolt/codeboltjs": "latest",
    "@codebolt/agent": "latest",
    "@codebolt/types": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "ts-loader": "^9.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 3. Agent Configuration (codeboltagent.yaml)

```yaml
title: Gemini CLI Agent
unique_id: gemini-cli-agent
version: 1.0.0
author: codebolt-team

initial_message: |
  Hello! I'm a coding assistant modeled after Gemini CLI.
  I can help you with reading, writing, and debugging code,
  running commands, and navigating your project.

description: A Gemini CLI-equivalent agent built on Codebolt Agent SDK
longDescription: >
  This agent replicates the behavior of Google's Gemini CLI,
  including its prompt system, tool execution pipeline, loop detection,
  and conversation management. Built using Codebolt Agent SDK v2
  Level 2 (Base Components).

tags:
  - coding
  - gemini
  - cli

metadata:
  agent_routing:
    worksonblankcode: true
    worksonexistingcode: true
    supportedlanguages:
      - typescript
      - javascript
      - python
      - rust
      - go
      - java
    supportedframeworks:
      - react
      - node
      - express
      - fastapi
    supportRemix: true

  defaultagentllm:
    strict: false
    modelorder:
      - claude-sonnet-4-20250514
      - gpt-4-turbo

actions:
  - name: Review Code
    description: Review the current file for issues
    detailDescription: Performs comprehensive code review
    actionPrompt: Please review this code for issues, bugs, and improvements.
  - name: Fix Bug
    description: Debug and fix the current issue
    detailDescription: Analyzes and fixes the identified bug
    actionPrompt: Please help me debug and fix this issue.
  - name: Refactor
    description: Refactor selected code
    detailDescription: Improves code structure and quality
    actionPrompt: Please refactor this code for better quality.
```

---

## 4. Implementation Phases

### Phase 1: Core Agent Loop (MVP)

**Goal:** Working agent with basic Gemini-like behavior.

**Files to create:**
- `src/index.ts` — Entry point with Level 2 loop
- `src/config.ts` — Configuration constants
- `src/prompt/systemPrompt.ts` — Basic system prompt

```typescript
// src/index.ts — Phase 1 MVP
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  AgentStep,
  ResponseExecutor
} from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
  ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { ProcessedMessage, AgentStepOutput } from '@codebolt/types/agent';
import { GEMINI_SYSTEM_PROMPT, MAX_TURNS, ALLOWED_TOOLS } from './config';

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  try {
    // Stage 1: Build initial prompt
    const promptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        new IdeContextModifier({
          includeActiveFile: true,
          includeOpenFiles: true,
          includeCursorPosition: true,
          includeSelectedText: true
        }),
        new CoreSystemPromptModifier({ customSystemPrompt: GEMINI_SYSTEM_PROMPT }),
        new ToolInjectionModifier({
          includeToolDescriptions: true,
          allowedTools: ALLOWED_TOOLS
        }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true })
      ],
      baseSystemPrompt: GEMINI_SYSTEM_PROMPT
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;
    let turnsRemaining = MAX_TURNS;

    // Stage 2: Agent loop
    while (!completed && turnsRemaining > 0) {
      const agentStep = new AgentStep({
        preInferenceProcessors: [
          new ChatCompressionModifier({ enableCompression: true })
        ],
        postInferenceProcessors: []
      });

      const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
      prompt = stepResult.nextMessage;

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

```typescript
// src/config.ts — Phase 1
export const MAX_TURNS = 100;

export const ALLOWED_TOOLS = [
  'codebolt--readFile',
  'codebolt--writeFile',
  'codebolt--editFile',
  'codebolt--executeCommand',
  'codebolt--listFiles',
  'codebolt--searchFiles',
  'codebolt--git_status',
  'codebolt--git_diff',
  'codebolt--git_add',
  'codebolt--git_commit',
  'codebolt--git_log'
];

export const GEMINI_SYSTEM_PROMPT = `
You are an interactive CLI agent specializing in software engineering tasks.
Your primary goal is to help users safely and efficiently.

# Core Mandates

1. Rigorously adhere to existing project conventions.
2. NEVER assume library/framework availability without verification.
3. Mimic existing style, structure, naming, and patterns.
4. Comments should be sparingly used, focusing on "why" not "what".
5. Fulfill requests thoroughly. Include tests for features and bug fixes.
6. Don't provide post-change summaries unless asked.

# Workflow for Software Engineering Tasks

1. **Understand & Strategize**: Use search and file reading tools extensively.
2. **Plan**: Build a coherent plan based on understanding.
3. **Implement**: Use edit/write tools to execute the plan.
4. **Verify (Tests)**: Run tests to validate changes.
5. **Verify (Standards)**: Run build, lint, type-check.
6. **Finalize**: Don't remove created files. Await next instruction.

# Operational Guidelines

- Be concise and direct. Minimal output per response.
- Execute independent tool calls in parallel.
- Always bypass interactive prompts (use --yes, run modes, etc.).
- Never introduce security vulnerabilities.

# Git Guidelines

- NEVER stage or commit unless explicitly instructed.
- Before committing: git status, git diff HEAD, git log -n 3.
- Always propose draft commit message.
- Never push without explicit request.

# Final Reminder

Your core function is efficient and safe assistance. Balance conciseness
with clarity. Always prioritize user control and project conventions.
Never assume file contents — read files first. Keep going until the
user's query is completely resolved.
`;
```

### Phase 2: Full Gemini Prompt System

**Goal:** Port all 15 system prompt sections with conditional rendering.

**Files to create:**
- `src/prompt/sections/*.ts` — Each render function as a separate module
- `src/prompt/systemPrompt.ts` — Composition function
- `src/prompt/toolNameMap.ts` — Tool name translation

```typescript
// src/prompt/systemPrompt.ts — Phase 2
import { renderPreamble } from './sections/preamble';
import { renderCoreMandates } from './sections/coreMandates';
import { renderPrimaryWorkflows, renderPlanningWorkflow } from './sections/workflows';
import { renderOperationalGuidelines } from './sections/guidelines';
import { renderGitRepo } from './sections/gitRepo';
import { renderSandbox } from './sections/sandbox';
import { renderFinalReminder } from './sections/finalReminder';

export interface GeminiPromptOptions {
  interactive: boolean;
  hasSkills: boolean;
  enableCodebaseInvestigator: boolean;
  enableWriteTodosTool: boolean;
  sandbox: 'macos-seatbelt' | 'generic' | 'outside';
  isGitRepo: boolean;
  isPlanMode: boolean;
}

export function buildGeminiSystemPrompt(options: GeminiPromptOptions): string {
  const sections: string[] = [];

  sections.push(renderPreamble(options.interactive));
  sections.push(renderCoreMandates(options));

  if (options.isPlanMode) {
    sections.push(renderPlanningWorkflow());
  } else {
    sections.push(renderPrimaryWorkflows(options));
  }

  sections.push(renderOperationalGuidelines(options));

  if (options.sandbox !== 'outside') {
    sections.push(renderSandbox(options.sandbox));
  }

  if (options.isGitRepo) {
    sections.push(renderGitRepo(options.interactive));
  }

  sections.push(renderFinalReminder());

  return sections
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
```

### Phase 3: Custom Modifiers & Processors

**Goal:** Add Gemini-specific features as custom modifiers/processors.

**Files to create:**
- `src/modifiers/GeminiSystemPromptModifier.ts`
- `src/modifiers/MemoryModifier.ts`
- `src/processors/LoopDetectionProcessor.ts`

```typescript
// src/modifiers/GeminiSystemPromptModifier.ts
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import { ProcessedMessage } from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { buildGeminiSystemPrompt, GeminiPromptOptions } from '../prompt/systemPrompt';

export class GeminiSystemPromptModifier extends BaseMessageModifier {
  private options: GeminiPromptOptions;

  constructor(options: GeminiPromptOptions) {
    super();
    this.options = options;
  }

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const systemPrompt = buildGeminiSystemPrompt(this.options);

    createdMessage.message.messages.unshift({
      role: 'system',
      content: systemPrompt
    });

    return createdMessage;
  }
}
```

```typescript
// src/processors/LoopDetectionProcessor.ts
import { BasePreInferenceProcessor } from '@codebolt/agent/processor-pieces/base';
import { ProcessedMessage } from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { createHash } from 'crypto';

interface LoopDetectionConfig {
  toolCallThreshold: number;      // Default: 5
  contentChunkThreshold: number;  // Default: 10
  contentChunkSize: number;       // Default: 50
  maxHistoryLength: number;       // Default: 5000
}

export class LoopDetectionProcessor extends BasePreInferenceProcessor {
  private config: LoopDetectionConfig;
  private lastToolCallHash: string = '';
  private consecutiveIdentical: number = 0;
  private contentHistory: string = '';

  constructor(config: Partial<LoopDetectionConfig> = {}) {
    super();
    this.config = {
      toolCallThreshold: config.toolCallThreshold ?? 5,
      contentChunkThreshold: config.contentChunkThreshold ?? 10,
      contentChunkSize: config.contentChunkSize ?? 50,
      maxHistoryLength: config.maxHistoryLength ?? 5000
    };
  }

  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Check for tool call loops in history
    const messages = createdMessage.message.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && 'tool_calls' in lastMessage) {
      const toolCalls = (lastMessage as any).tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        const hash = this.hashToolCall(toolCalls[0]);
        if (hash === this.lastToolCallHash) {
          this.consecutiveIdentical++;
          if (this.consecutiveIdentical >= this.config.toolCallThreshold) {
            // Loop detected — inject warning
            createdMessage.message.messages.push({
              role: 'system',
              content: 'LOOP DETECTED: You have made the same tool call ' +
                this.consecutiveIdentical + ' times consecutively. ' +
                'Please try a different approach or ask the user for help.'
            });
            this.consecutiveIdentical = 0;
          }
        } else {
          this.lastToolCallHash = hash;
          this.consecutiveIdentical = 1;
        }
      }
    }

    return createdMessage;
  }

  private hashToolCall(toolCall: any): string {
    const data = `${toolCall.function?.name || ''}:${toolCall.function?.arguments || ''}`;
    return createHash('sha256').update(data).digest('hex');
  }

  reset(): void {
    this.lastToolCallHash = '';
    this.consecutiveIdentical = 0;
    this.contentHistory = '';
  }
}
```

### Phase 4: Advanced Features

**Goal:** Next-speaker checker, model routing, session recording.

```typescript
// src/services/nextSpeakerChecker.ts
import codebolt from '@codebolt/codeboltjs';

export async function checkNextSpeaker(
  lastModelResponse: string
): Promise<'user' | 'model'> {
  // Fast-path: if response is empty, model should continue
  if (!lastModelResponse || lastModelResponse.trim() === '') {
    return 'model';
  }

  // Fast-path: if response ends with a question, it's for the user
  if (lastModelResponse.trim().endsWith('?')) {
    return 'user';
  }

  // LLM check for ambiguous cases
  const analysis = await codebolt.llm.inference({
    messages: [
      {
        role: 'system',
        content: `Determine if the AI assistant should continue speaking or wait for the user.
Rules:
1. "model" if the assistant states an immediate next action or appears incomplete
2. "user" if the assistant asks a direct question
3. "user" if the assistant has completed its response
Respond with only "user" or "model".`
      },
      {
        role: 'user',
        content: `Last assistant message:\n${lastModelResponse.slice(-2000)}`
      }
    ]
  });

  const decision = analysis.completion?.choices?.[0]?.message?.content?.trim()?.toLowerCase();
  return decision === 'model' ? 'model' : 'user';
}
```

### Phase 5: Polish & Testing

**Goal:** Type checking, error handling, edge cases.

```bash
# After each phase:
npm install
npx tsc --noEmit      # Type check
npx eslint src/        # Lint
npm run build          # Build
```

---

## 5. Updated index.ts (Full Implementation)

```typescript
// src/index.ts — Complete implementation with all phases
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  AgentStep,
  ResponseExecutor
} from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
  ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { ProcessedMessage, AgentStepOutput } from '@codebolt/types/agent';

// Custom components
import { GeminiSystemPromptModifier } from './modifiers/GeminiSystemPromptModifier';
import { MemoryModifier } from './modifiers/MemoryModifier';
import { LoopDetectionProcessor } from './processors/LoopDetectionProcessor';
import { checkNextSpeaker } from './services/nextSpeakerChecker';
import { MAX_TURNS, ALLOWED_TOOLS, GEMINI_PROMPT_OPTIONS } from './config';

// State
const loopDetector = new LoopDetectionProcessor({
  toolCallThreshold: 5,
  contentChunkThreshold: 10
});

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  try {
    // Reset loop detection for new message
    loopDetector.reset();

    // === INITIAL PROMPT GENERATION ===
    const promptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        new IdeContextModifier({
          includeActiveFile: true,
          includeOpenFiles: true,
          includeCursorPosition: true,
          includeSelectedText: true
        }),
        new GeminiSystemPromptModifier(GEMINI_PROMPT_OPTIONS),
        new MemoryModifier(),
        new ToolInjectionModifier({
          includeToolDescriptions: true,
          allowedTools: ALLOWED_TOOLS
        }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true })
      ],
      baseSystemPrompt: '' // Set by GeminiSystemPromptModifier
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;
    let turnsRemaining = MAX_TURNS;

    // === AGENT LOOP ===
    while (!completed && turnsRemaining > 0) {

      // --- LLM Call ---
      const agentStep = new AgentStep({
        preInferenceProcessors: [
          new ChatCompressionModifier({ enableCompression: true }),
          loopDetector
        ],
        postInferenceProcessors: []
      });

      const stepResult: AgentStepOutput = await agentStep.executeStep(
        reqMessage,
        prompt
      );
      prompt = stepResult.nextMessage;

      // --- Tool Execution ---
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

      // --- Next Speaker Check ---
      if (completed && turnsRemaining > 1) {
        // Check if model should continue (Gemini's NextSpeakerChecker)
        const rawResponse = stepResult.rawLLMResponse;
        const lastContent = rawResponse?.choices?.[0]?.message?.content || '';

        if (lastContent) {
          const nextSpeaker = await checkNextSpeaker(lastContent);
          if (nextSpeaker === 'model') {
            completed = false; // Force continuation
          }
        }
      }

      turnsRemaining--;
    }

    // Max turns warning
    if (turnsRemaining <= 0 && !completed) {
      codebolt.chat.sendMessage(
        'Maximum turns reached. Please provide further instructions.',
        {}
      );
    }

  } catch (error) {
    console.error('Agent error:', error);
    codebolt.chat.sendMessage(`Error: ${error}`, {});
  }
});
```

---

## 6. Build & Deploy

```bash
# 1. Install dependencies
npm install

# 2. Type check
npx tsc --noEmit

# 3. Lint
npx eslint src/

# 4. Build
npm run build

# 5. Verify
ls -la dist/

# 6. Test locally
npx codebolt-cli startagent .

# 7. Publish
npx codebolt-cli publishagent .
```

---

## 7. Phase Summary

| Phase | What's Built | Gemini Features Covered |
|-------|-------------|------------------------|
| **Phase 1** | Core agent loop with basic prompt | Agent loop, tool execution, basic prompt, compression |
| **Phase 2** | Full 15-section prompt system | All prompt sections, conditional rendering, tool name mapping |
| **Phase 3** | Custom modifiers & processors | Loop detection, memory, plan mode |
| **Phase 4** | Advanced services | Next speaker, model routing, session recording |
| **Phase 5** | Polish & testing | Type safety, error handling, edge cases |

### Estimated Lines of Code

| Component | Est. Lines |
|-----------|-----------|
| `src/index.ts` | ~120 |
| `src/config.ts` | ~50 |
| `src/prompt/systemPrompt.ts` | ~80 |
| `src/prompt/sections/*.ts` (7 files) | ~600 total |
| `src/modifiers/*.ts` (3 files) | ~150 total |
| `src/processors/*.ts` (3 files) | ~200 total |
| `src/services/*.ts` (3 files) | ~150 total |
| `src/utils/*.ts` (2 files) | ~100 total |
| **Total** | **~1,450 lines** |

Compare: Gemini CLI core is ~15,000+ lines. Codebolt SDK eliminates ~90% of the boilerplate.
