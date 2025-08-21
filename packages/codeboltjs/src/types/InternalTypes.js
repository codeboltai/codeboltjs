"use strict";
/**
 * Internal TypeScript types for the codeboltjs library implementation
 *
 * This file contains types that are used internally by the library:
 * - Internal class structures
 * - Implementation-specific interfaces
 * - Private API types
 * - Module-specific types
 * - WebSocket management types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = void 0;
class InternalError extends Error {
    constructor(message, code, module, severity = 'medium', context) {
        super(message);
        this.code = code;
        this.module = module;
        this.severity = severity;
        this.context = context;
        this.name = 'InternalError';
        this.timestamp = Date.now();
        this.stackTrace = this.stack;
    }
}
exports.InternalError = InternalError;
// ================================
// Parser Internal Types
// ================================
// LanguageParser interface already defined above at line 154
