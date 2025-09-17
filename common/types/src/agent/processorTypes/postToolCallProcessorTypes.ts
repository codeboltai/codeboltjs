/**
 * Post-Tool Call Processor Types
 * These are called after the Tool Call
 * Help in checking the tool call results and adding them to the LLM message
 * This LLM Message will be used as prompt for the next time
 */

import { LLMCompletion } from '../../sdk-types';
import { 
    ProcessedMessage, 
    ToolResult
} from '../common';

export interface PostToolCallProcessor {
    modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput>;
 
}

export interface PostToolCallProcessorInput {
    llmMessageSent: ProcessedMessage;
    rawLLMResponseMessage: LLMCompletion;
    nextPrompt: ProcessedMessage;
    toolResults?: ToolResult[];
}

export interface PostToolCallProcessorOutput {
    nextPrompt: ProcessedMessage;
    shouldExit:boolean
}

