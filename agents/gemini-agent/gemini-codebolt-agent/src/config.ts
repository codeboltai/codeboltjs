/**
 * Agent Configuration — Constants and defaults for the Gemini CLI Agent.
 * Equivalent to Gemini CLI's config.ts + flag parsing + GEMINI.md defaults.
 *
 * All tunables live here so the main entry point stays clean.
 */
import type { GeminiPromptOptions } from './prompt/systemPrompt';
import type { LoopDetectionConfig } from './processors/LoopDetectionProcessor';

// ─── Agent Loop Limits ───────────────────────────────────────────────
export const MAX_AGENT_TURNS = 100;
export const MAX_CONTINUATION_TURNS = 5;

// ─── Token Thresholds ────────────────────────────────────────────────
export const COMPRESSION_TOKEN_THRESHOLD = 0.5;

// ─── Default Prompt Options ──────────────────────────────────────────
export const DEFAULT_PROMPT_OPTIONS: GeminiPromptOptions = {
  interactive: true,
  hasSkills: false,
  explainBeforeActing: false,
  enableCodebaseInvestigator: true,
  enableWriteTodosTool: true,
  enableShellEfficiency: true,
  sandbox: 'generic',
  isGitRepo: false,
  isPlanMode: false,
};

// ─── Loop Detection Tuning ───────────────────────────────────────────
export const LOOP_DETECTION_CONFIG: Partial<LoopDetectionConfig> = {
  toolCallThreshold: 5,
  contentChunkThreshold: 10,
  contentChunkSize: 50,
  maxHistoryLength: 5000,
  llmCheckAfterTurns: 30,
  llmCheckInterval: 3,
  llmConfidenceThreshold: 0.9,
};

// ─── Allowed MCP Tools ───────────────────────────────────────────────
// Full set of Codebolt MCP tools exposed to the LLM (mirrors Gemini CLI's tool registry).
export const ALLOWED_TOOLS: string[] = [
  // File operations
  'codebolt--readFile',
  'codebolt--writeFile',
  'codebolt--editFile',
  'codebolt--createFile',
  'codebolt--deleteFile',
  'codebolt--listFiles',
  'codebolt--searchFiles',

  // Terminal
  'codebolt--executeCommand',

  // Git
  'codebolt--git_status',
  'codebolt--git_diff',
  'codebolt--git_log',
  'codebolt--git_add',
  'codebolt--git_commit',

  // Browser
  'codebolt--goToPage',
  'codebolt--screenshot',
  'codebolt--click',
  'codebolt--type',
  'codebolt--getMarkdown',
];
