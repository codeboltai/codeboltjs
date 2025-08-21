/**
 * @codebolt/types/sdk - SDK Types Export
 * 
 * This module provides TypeScript types for the CodeboltJS SDK functions.
 * These are the types that developers use when working with the CodeboltJS library.
 * 
 * Usage Examples:
 * 
 * // Import SDK function return types
 * import { CreateFileResponse, ReadFileResponse } from '@codebolt/types/sdk';
 * 
 * // Import browser types
 * import { BrowserActionResponseData, GoToPageResponse } from '@codebolt/types/sdk';
 * 
 * // Import LLM types
 * import { LLMResponse } from '@codebolt/types/sdk';
 * 
 * Available SDK Types:
 * - File System: CreateFileResponse, ReadFileResponse, etc.
 * - Browser: BrowserActionResponseData, GoToPageResponse, etc.
 * - Terminal: CommandOutput, CommandError, etc.
 * - Git: GitCommitResponse, GitStatusResponse, etc.
 * - LLM: LLMResponse
 * - Memory: MemorySetResponse, MemoryGetResponse, etc.
 * - And many more organized by functionality
 */

// Export all SDK function types
export * from './codeboltjstypes/libFunctionTypes';
