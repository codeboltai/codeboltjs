import { BaseCodeboltAgentNode } from '@codebolt/agent-shared-nodes';
import { CodeboltAgent } from '@codebolt/agent/unified';
import codebolt from '@codebolt/codeboltjs';
import {
    MessageModifier,
    PostInferenceProcessor,
    PostToolCallProcessor,
    PreInferenceProcessor,
    PreToolCallProcessor
} from "@codebolt/types/agent";

/**
 * CodeboltAgentNode - Backend implementation that wraps the CodeboltAgent class
 * Processes user messages through configurable processors and executes the complete agent loop
 * 
 * Input slots:
 *   0: trigger (ACTION trigger)
 *   1: message (FlatUserMessage)
 *   2: messageModifiers (MessageModifier[])
 *   3: preInferenceProcessors (PreInferenceProcessor[])
 *   4: postInferenceProcessors (PostInferenceProcessor[])
 *   5: preToolCallProcessors (PreToolCallProcessor[])
 *   6: postToolCallProcessors (PostToolCallProcessor[])
 * 
 * Output slots:
 *   0: onComplete (EVENT)
 *   1: onError (EVENT)
 *   2: result (object)
 *   3: success (boolean)
 *   4: error (string)
 */
export class CodeboltAgentNode extends BaseCodeboltAgentNode {
    private agent: CodeboltAgent | null = null;

    constructor() {
        super();
    }

    async onExecute() {
        // Debug: Send message when triggered
        await codebolt.chat.sendMessage(`[DEBUG] CodeboltAgentNode.onExecute triggered`, {});

        try {
            const message = this.getInputData(1) as any; // message input
            const messageModifiers = this.getInputData(2) as MessageModifier[] || [];
            const preInferenceProcessors = this.getInputData(3) as PreInferenceProcessor[] || [];
            const postInferenceProcessors = this.getInputData(4) as PostInferenceProcessor[] || [];
            const preToolCallProcessors = this.getInputData(5) as PreToolCallProcessor[] || [];
            const postToolCallProcessors = this.getInputData(6) as PostToolCallProcessor[] || [];

            // Validate inputs
            if (!message) {
                this.setOutputData(2, { success: false, result: null, error: 'Error: Message input is required' });
                this.setOutputData(3, false);
                this.setOutputData(4, 'Error: Message input is required');
                this.triggerSlot(1, null, null); // onError
                return;
            }

            // Create agent configuration from properties and inputs
            const config = {
                instructions: (this.properties.instructions as string) || 'You are an AI coding assistant.',
                processors: {
                    messageModifiers: messageModifiers,
                    preInferenceProcessors: preInferenceProcessors,
                    postInferenceProcessors: postInferenceProcessors,
                    preToolCallProcessors: preToolCallProcessors,
                    postToolCallProcessors: postToolCallProcessors
                },
                enableLogging: (this.properties.enableLogging as boolean) !== false
            };

            // Create agent instance
            this.agent = new CodeboltAgent(config);

            // Process the message directly
            const result = await this.agent.processMessage(message);

            // Update outputs with execution result
            this.setOutputData(2, result); // result (slot 2)
            this.setOutputData(3, result.success); // success (slot 3)
            this.setOutputData(4, result.error || null); // error (slot 4)

            // Trigger appropriate event
            if (result.success) {
                this.triggerSlot(0, null, null); // onComplete
            } else {
                this.triggerSlot(1, null, null); // onError
            }

        } catch (error) {
            const errorMessage = `Error: Failed to execute CodeboltAgent - ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.setOutputData(2, { success: false, result: null, error: errorMessage });
            this.setOutputData(3, false);
            this.setOutputData(4, errorMessage);
            this.triggerSlot(1, null, null); // onError
            console.error('CodeboltAgentNode error:', error);
        }
    }
}
