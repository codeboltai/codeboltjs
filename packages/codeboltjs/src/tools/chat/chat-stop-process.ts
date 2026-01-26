/**
 * Chat Stop Process Tool - Stops the ongoing process
 * Wraps the SDK's cbchat.stopProcess() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ChatStopProcess tool (no parameters required)
 */
export interface ChatStopProcessToolParams {
    // No parameters required
}

class ChatStopProcessToolInvocation extends BaseToolInvocation<
    ChatStopProcessToolParams,
    ToolResult
> {
    constructor(params: ChatStopProcessToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbchat.stopProcess();

            return {
                llmContent: 'Process stopped successfully',
                returnDisplay: 'Successfully stopped the process',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error stopping process: ${errorMessage}`,
                returnDisplay: `Error stopping process: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatStopProcess tool logic
 */
export class ChatStopProcessTool extends BaseDeclarativeTool<
    ChatStopProcessToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_stop_process';

    constructor() {
        super(
            ChatStopProcessTool.Name,
            'ChatStopProcess',
            `Stops the ongoing process. Sends a stop signal to the server to terminate the current operation.`,
            Kind.Execute,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(
        params: ChatStopProcessToolParams,
    ): ToolInvocation<ChatStopProcessToolParams, ToolResult> {
        return new ChatStopProcessToolInvocation(params);
    }
}
