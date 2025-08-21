"use strict";
/**
 * Common TypeScript types and interfaces shared across the codeboltjs library
 *
 * This file contains:
 * - Shared data structures
 * - Common enums
 * - Utility types
 * - Application state types
 * - Git-related types
 * - Vector database types
 * - General purpose interfaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeboltError = exports.LogType = void 0;
// ================================
// Log Types
// ================================
var LogType;
(function (LogType) {
    /** Informational messages */
    LogType["info"] = "info";
    /** Error messages */
    LogType["error"] = "error";
    /** Warning messages */
    LogType["warning"] = "warning";
})(LogType || (exports.LogType = LogType = {}));
class CodeboltError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'CodeboltError';
        this.timestamp = new Date().toISOString();
    }
}
exports.CodeboltError = CodeboltError;
