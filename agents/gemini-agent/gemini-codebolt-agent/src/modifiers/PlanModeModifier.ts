/**
 * Custom modifier for Plan Mode.
 * When active, restricts tools to read-only and injects the 4-phase planning workflow.
 * Equivalent to Gemini CLI's ApprovalMode.PLAN.
 */
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';

/** Read-only tools allowed in plan mode. */
export const PLAN_MODE_TOOLS = [
  'codebolt--readFile',
  'codebolt--listFiles',
  'codebolt--searchFiles',
  'codebolt--git_status',
  'codebolt--git_log',
  'codebolt--git_diff',
];

export class PlanModeModifier extends BaseMessageModifier {
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    super();
    this.enabled = enabled;
  }

  async modify(
    _originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    if (!this.enabled) return createdMessage;

    createdMessage.message.messages.push({
      role: 'system',
      content: [
        '# PLAN MODE ACTIVE',
        '',
        'You are currently in **read-only plan mode**. You may ONLY use read-only tools.',
        'Do NOT create, edit, write, or execute any commands that modify the file system.',
        '',
        'Your task is to explore the codebase and produce a detailed implementation plan.',
        'Follow the 4-phase planning workflow defined in your instructions.',
        '',
        'Allowed tools: ' + PLAN_MODE_TOOLS.map(t => `\`${t}\``).join(', '),
      ].join('\n'),
    });

    return createdMessage;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
