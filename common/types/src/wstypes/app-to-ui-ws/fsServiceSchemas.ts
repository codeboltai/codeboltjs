import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * File System Service Message Schemas
 * Based on fsService.cli.ts
 */

// File operation response schemas
export const createFileResponseSchema = z.object({
  type: z.literal('createFileResponse'),
  success: z.boolean(),
  message: z.string(),
  fileName: z.string().optional(),
  error: z.string().optional(),
});

export const createFolderResponseSchema = z.object({
  type: z.literal('createFolderResponse'),
  success: z.boolean(),
  message: z.string(),
  folderName: z.string().optional(),
  error: z.string().optional(),
});

export const readFileResponseSchema = z.object({
  type: z.literal('readFileResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  filename: z.string().optional(),
  content: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const updateFileResponseSchema = z.object({
  type: z.literal('updateFileResponse'),
  success: z.boolean(),
  message: z.string(),
  newContent: z.string().optional(),
  error: z.string().optional(),
});

export const deleteFileResponseSchema = z.object({
  type: z.literal('deleteFileResponse'),
  success: z.boolean(),
  message: z.string(),
  filename: z.string().optional(),
  error: z.string().optional(),
});

export const deleteFolderResponseSchema = z.object({
  type: z.literal('deleteFolderResponse'),
  success: z.boolean(),
  message: z.string(),
  foldername: z.string().optional(),
  error: z.string().optional(),
});

export const fileListResponseSchema = z.object({
  type: z.literal('fileListResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  files: z.array(z.string()).optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const listCodeDefinitionNamesResponseSchema = z.object({
  type: z.literal('listCodeDefinitionNamesResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const searchFilesResponseSchema = z.object({
  type: z.literal('searchFilesResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const grepSearchResponseSchema = z.object({
  type: z.literal('grepSearchResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const fileSearchResponseSchema = z.object({
  type: z.literal('fileSearchResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const editFileAndApplyDiffResponseSchema = z.object({
  type: z.literal('editFileAndApplyDiffResponse'),
  success: z.literal(true),
  result: z.any(),
});

// FS MCP tool execution schemas
export const fsMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('fs'),
    toolName: z.string(),
    serverName: z.literal('codebolt-fs'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const fsMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('fs'),
    toolName: z.string(),
    serverName: z.literal('codebolt-fs'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const fsMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('fs'),
    toolName: z.string(),
    serverName: z.literal('codebolt-fs'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const fsMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('fs'),
    toolName: z.string(),
    serverName: z.literal('codebolt-fs'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const fsMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('fs'),
    toolName: z.string(),
    serverName: z.literal('codebolt-fs'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const fsErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all FS service schemas
export const fsServiceMessageSchema = z.union([
  fsErrorResponseSchema,
  createFileResponseSchema,
  createFolderResponseSchema,
  readFileResponseSchema,
  updateFileResponseSchema,
  deleteFileResponseSchema,
  deleteFolderResponseSchema,
  fileListResponseSchema,
  listCodeDefinitionNamesResponseSchema,
  searchFilesResponseSchema,
  grepSearchResponseSchema,
  fileSearchResponseSchema,
  editFileAndApplyDiffResponseSchema,
  fsMcpToolConfirmationSchema,
  fsMcpToolExecutingSchema,
  fsMcpToolSuccessSchema,
  fsMcpToolErrorSchema,
  fsMcpToolRejectedSchema,
]);

// TypeScript types
export type CreateFileResponse = z.infer<typeof createFileResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type CreateFolderResponse = z.infer<typeof createFolderResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type ReadFileResponse = z.infer<typeof readFileResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type UpdateFileResponse = z.infer<typeof updateFileResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type DeleteFileResponse = z.infer<typeof deleteFileResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type DeleteFolderResponse = z.infer<typeof deleteFolderResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FileListResponse = z.infer<typeof fileListResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type ListCodeDefinitionNamesResponse = z.infer<typeof listCodeDefinitionNamesResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type SearchFilesResponse = z.infer<typeof searchFilesResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type GrepSearchResponse = z.infer<typeof grepSearchResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FileSearchResponse = z.infer<typeof fileSearchResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type EditFileAndApplyDiffResponse = z.infer<typeof editFileAndApplyDiffResponseSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsMcpToolConfirmation = z.infer<typeof fsMcpToolConfirmationSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsMcpToolExecuting = z.infer<typeof fsMcpToolExecutingSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsMcpToolSuccess = z.infer<typeof fsMcpToolSuccessSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsMcpToolError = z.infer<typeof fsMcpToolErrorSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsMcpToolRejected = z.infer<typeof fsMcpToolRejectedSchema>;
export type FsErrorResponse = z.infer<typeof fsErrorResponseSchema>;export type FsServiceMessage = z.infer<typeof fsServiceMessageSchema>; 