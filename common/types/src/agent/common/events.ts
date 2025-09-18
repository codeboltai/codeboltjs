/**
 * Common Event Types
 * Shared across processor types
 */

import { ProcessedMessage } from './messages';

export interface ExitEvent {
    type: 'exit';
    reason: string;
    error?: string;
    metadata?: Record<string, unknown>;
}

export interface LLMInferenceTriggerEvent {
    type: 'llm_inference_trigger';
    reason: string;
    updatedMessage: ProcessedMessage;
    retryCount?: number;
    metadata?: Record<string, unknown>;
}
