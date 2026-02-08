/**
 * Maps Gemini CLI tool names to Codebolt MCP tool names.
 * Gemini uses snake_case; Codebolt uses toolbox--camelCase.
 */
export const TOOL_MAP = {
  read_file: 'codebolt--readFile',
  write_file: 'codebolt--writeFile',
  edit: 'codebolt--editFile',
  shell: 'codebolt--executeCommand',
  grep: 'codebolt--searchFiles',
  glob: 'codebolt--listFiles',
  ls: 'codebolt--listFiles',
  web_fetch: 'codebolt--webFetch',
  web_search: 'codebolt--webSearch',
  memory: 'codebolt--memory',
  git_status: 'codebolt--git_status',
  git_diff: 'codebolt--git_diff',
  git_add: 'codebolt--git_add',
  git_commit: 'codebolt--git_commit',
  git_log: 'codebolt--git_log',
} as const;

/** Returns the Codebolt tool name for use in prompt text. */
export function cbTool(geminiName: keyof typeof TOOL_MAP): string {
  return TOOL_MAP[geminiName];
}
