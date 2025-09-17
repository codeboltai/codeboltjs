/**
 * Common Validation Types
 * Shared across processor types
 */

import { ProcessedMessage } from './messages';

export interface ValidationRule {
    name: string;
    validator: (response: ProcessedMessage) => boolean;
    errorMessage: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: Record<string, unknown>;
}

export interface ToolValidationRule {
    toolName: string;
    validator: (toolInput: unknown) => boolean;
    errorMessage: string;
}

export interface ToolValidationResult {
    isValid: boolean;
    toolName: string;
    errors: string[];
    warnings: string[];
    metadata?: Record<string, unknown>;
}
