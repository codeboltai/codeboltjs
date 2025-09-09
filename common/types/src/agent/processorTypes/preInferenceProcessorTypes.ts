/**
 * Pre-Inference Processor Types
 * These are called before the Agent calls the LLM
 * Called by AgentStep before the LLM calling step
 */

import { FlatUserMessage } from '../../sdk-types';
import { ProcessedMessage, ExitEvent } from '../common';

export interface PreInferenceProcessor {
    modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
   
}

