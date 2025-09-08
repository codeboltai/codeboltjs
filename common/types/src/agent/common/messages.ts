/**
 * Common Message Types
 * Shared across all processor types
 */

import { Message } from '../../sdk-types';

export interface ProcessedMessage {
    messages: Message[];
    metadata?: Record<string, unknown>;
}

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string | Record<string, unknown>;
    };
}