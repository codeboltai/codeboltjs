/**
 * Pre-Tool Call Processor Types
 * These are called before the Tool Call
 * Used to check if the Tool Call is proper and handle Local Tool Interceptor
 * or any other custom exotic tool Processor
 */

import { LLMCompletion } from '../../sdk-types';
import { 
    ProcessedMessage, 
} from '../common';

export interface PreToolCallProcessor {
    modify(input: PreToolCallProcessorInput): Promise<PreToolCallProcessorOutput>;
}

export interface PreToolCallProcessorInput {
    llmMessageSent: ProcessedMessage;
    rawLLMResponseMessage: LLMCompletion;
    nextPrompt: ProcessedMessage;
}

export interface PreToolCallProcessorOutput {
    nextPrompt: ProcessedMessage;
    shouldExit?: boolean;
}
