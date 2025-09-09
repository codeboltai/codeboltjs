/**
 * Common Message Types
 * Shared across all processor types
 */

import {  LLMInferenceParams } from '../../sdk-types';

export interface ProcessedMessage  {
    message:LLMInferenceParams,
    metadata?: Record<string, unknown>;
}


export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string | Record<string, unknown>;
    };
}