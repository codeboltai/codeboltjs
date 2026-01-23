/**
 * Hook Create Tool - Creates a new hook
 * Wraps the SDK's hook.create() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import hook from '../../modules/hook';
import type { HookTrigger, HookAction, HookCondition } from '../../types/hook';

/**
 * Parameters for the HookCreate tool
 */
export interface HookCreateToolParams {
    /**
     * Name of the hook
     */
    name: string;

    /**
     * Description of the hook (optional)
     */
    description?: string;

    /**
     * The trigger event type
     */
    trigger: HookTrigger;

    /**
     * Trigger configuration (optional)
     */
    trigger_config?: {
        pattern?: string;
        path?: string;
        command?: string;
        eventType?: string;
    };

    /**
     * The action to perform when triggered
     */
    action: HookAction;

    /**
     * Action configuration (optional)
     */
    action_config?: {
        message?: string;
        command?: string;
        url?: string;
        agentId?: string;
        payload?: Record<string, any>;
    };

    /**
     * Whether the hook is enabled (optional, defaults to true)
     */
    enabled?: boolean;

    /**
     * Priority of the hook (optional)
     */
    priority?: number;

    /**
     * Conditions for the hook (optional)
     */
    conditions?: HookCondition[];
}

class HookCreateToolInvocation extends BaseToolInvocation<
    HookCreateToolParams,
    ToolResult
> {
    constructor(params: HookCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await hook.create({
                name: this.params.name,
                description: this.params.description,
                trigger: this.params.trigger,
                triggerConfig: this.params.trigger_config,
                action: this.params.action,
                actionConfig: this.params.action_config,
                enabled: this.params.enabled,
                priority: this.params.priority,
                conditions: this.params.conditions,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error creating hook: ${errorMsg}`,
                    returnDisplay: `Error creating hook: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const hookData = response.data;
            const llmContent = hookData
                ? `Successfully created hook "${hookData.name}" with ID: ${hookData.id}\n\nHook Details:\n- Trigger: ${hookData.trigger}\n- Action: ${hookData.action}\n- Enabled: ${hookData.enabled}`
                : `Successfully created hook "${this.params.name}"`;

            return {
                llmContent,
                returnDisplay: `Successfully created hook "${this.params.name}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating hook: ${errorMessage}`,
                returnDisplay: `Error creating hook: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the HookCreate tool logic
 */
export class HookCreateTool extends BaseDeclarativeTool<
    HookCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'hook_create';

    constructor() {
        super(
            HookCreateTool.Name,
            'HookCreate',
            `Creates a new hook for triggering actions based on events. Hooks can be configured to respond to file changes, git operations, terminal commands, agent events, and more.`,
            Kind.Edit,
            {
                properties: {
                    name: {
                        description: 'The name of the hook',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the hook',
                        type: 'string',
                    },
                    trigger: {
                        description: "The trigger event type (e.g., 'file.created', 'file.modified', 'file.deleted', 'git.commit', 'git.push', 'git.pull', 'terminal.command', 'agent.start', 'agent.end', 'message.received', 'custom')",
                        type: 'string',
                        enum: ['file.created', 'file.modified', 'file.deleted', 'git.commit', 'git.push', 'git.pull', 'terminal.command', 'agent.start', 'agent.end', 'message.received', 'custom'],
                    },
                    trigger_config: {
                        description: 'Optional trigger configuration object with pattern, path, command, or eventType fields',
                        type: 'object',
                    },
                    action: {
                        description: "The action to perform when triggered (e.g., 'notify', 'execute', 'log', 'webhook', 'agent')",
                        type: 'string',
                        enum: ['notify', 'execute', 'log', 'webhook', 'agent'],
                    },
                    action_config: {
                        description: 'Optional action configuration object with message, command, url, agentId, or payload fields',
                        type: 'object',
                    },
                    enabled: {
                        description: 'Whether the hook is enabled (defaults to true)',
                        type: 'boolean',
                    },
                    priority: {
                        description: 'Priority of the hook (higher priority hooks run first)',
                        type: 'number',
                    },
                    conditions: {
                        description: 'Optional array of conditions that must be met for the hook to trigger',
                        type: 'array',
                    },
                },
                required: ['name', 'trigger', 'action'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: HookCreateToolParams,
    ): string | null {
        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        const validTriggers = ['file.created', 'file.modified', 'file.deleted', 'git.commit', 'git.push', 'git.pull', 'terminal.command', 'agent.start', 'agent.end', 'message.received', 'custom'];
        if (!validTriggers.includes(params.trigger)) {
            return `Invalid trigger type: ${params.trigger}. Must be one of: ${validTriggers.join(', ')}`;
        }

        const validActions = ['notify', 'execute', 'log', 'webhook', 'agent'];
        if (!validActions.includes(params.action)) {
            return `Invalid action type: ${params.action}. Must be one of: ${validActions.join(', ')}`;
        }

        return null;
    }

    protected createInvocation(
        params: HookCreateToolParams,
    ): ToolInvocation<HookCreateToolParams, ToolResult> {
        return new HookCreateToolInvocation(params);
    }
}
