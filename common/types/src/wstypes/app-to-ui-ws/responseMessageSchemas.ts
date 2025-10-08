import { z } from 'zod';

/**
 * Response Message Schemas for App-to-UI Communication
 * Based on direct WebSocket response patterns in CLI services
 */

// AI request state enum schema
export const aiRequestStateEnumSchema = z.enum([
  'SENDING_REQUEST',
  'REQUEST_SUCCESS',
  'REQUEST_ERROR'
]);

// Base response message schema
export const baseResponseMessageSchema = z.object({
  type: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  data: z.any().optional(),
  payload: z.any().optional(),
});

// Generic success response schema
export const successResponseSchema = baseResponseMessageSchema.extend({
  success: z.literal(true),
  message: z.string(),
});

// Generic error response schema
export const errorResponseSchema = baseResponseMessageSchema.extend({
  success: z.literal(false),
  error: z.string(),
});

// File operation response schemas
export const createFileResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('createFileResponse'),
  success: z.boolean(),
  message: z.string(),
  fileName: z.string().optional(),
  error: z.string().optional(),
});

export const readFileResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('readFileResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  filename: z.string().optional(),
  content: z.string().optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

export const updateFileResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('updateFileResponse'),
  success: z.boolean(),
  message: z.string(),
  newContent: z.string().optional(),
  error: z.string().optional(),
});

export const deleteFileResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('deleteFileResponse'),
  success: z.boolean(),
  message: z.string(),
  filename: z.string().optional(),
  error: z.string().optional(),
});

export const fileListResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('fileListResponse'),
  success: z.boolean(),
  message: z.string().optional(),
  files: z.array(z.string()).optional(),
  result: z.any().optional(),
  error: z.string().optional(),
});

// Git operation response schemas
export const gitInitResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitInitResponse'),
  success: z.literal(true),
});

export const gitCommitResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitCommitResponse'),
  success: z.literal(true),
  content: z.any(),
});

export const gitPushResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitPushResponse'),
  success: z.literal(true),
});

export const gitStatusResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitStatusResponse'),
  success: z.literal(true),
  data: z.string(),
});

export const gitLogsResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitLogsResponse'),
  success: z.literal(true),
  data: z.string(),
});

export const gitDiffResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('gitDiffResponse'),
  success: z.literal(true),
  data: z.string(),
});

// MCP response schemas
export const getEnabledToolBoxesResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getEnabledToolBoxesResponse'),
  data: z.record(z.any()),
});

export const getAvailableToolBoxesResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getAvailableToolBoxesResponse'),
  data: z.record(z.any()),
});

export const getLocalToolBoxesResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getLocalToolBoxesResponse'),
  data: z.record(z.any()),
});

export const executeToolResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('executeToolResponse'),
  data: z.array(z.any()),
});

// Task response schemas
export const addTaskResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('addTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const updateTasksResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('updateTasksResponse'),
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

export const deleteTaskResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('deleteTaskResponse'),
  success: z.boolean(),
  error: z.string().optional(),
});

export const createTasksFromMarkdownResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('createTasksFromMarkdownResponse'),
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  agentId: z.string().optional(),
});

// State response schemas
export const getAppStateResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getAppStateResponse'),
  state: z.any(),
});

export const getAgentStateResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getAgentStateResponse'),
  payload: z.any(),
});

export const addToAgentStateResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('addToAgentStateResponse'),
  payload: z.object({
    sucess: z.boolean(),
  }),
});

// Project response schemas
export const getProjectPathResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getProjectPathResponse'),
  success: z.literal(true),
  message: z.string(),
  projectPath: z.string(),
});

export const getProjectSettingsResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getProjectSettingsResponse'),
  success: z.literal(true),
  message: z.string(),
  projectSettings: z.any(),
});

export const getRepoMapResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getRepoMapResponse'),
  success: z.literal(true),
  message: z.string(),
  repoMap: z.any(),
});

// Vector DB response schemas
export const addVectorItemResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('addVectorItemResponse'),
  message: z.literal('success'),
});

export const getVectorResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getVectorResponse'),
  vector: z.any(),
});

export const queryVectorItemResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('queryVectorItemResponse'),
  item: z.any(),
});

// Tokenizer response schemas
export const addTokenResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('addTokenResponse'),
  message: z.literal('success'),
  tokens: z.any(),
});

export const getTokenResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getTokenResponse'),
  token: z.any(),
});

// Chat history response schemas
export const getSummarizeAllResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getSummarizeAllResponse'),
  payload: z.any(),
});

export const getSummarizeResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getSummarizeResponse'),
  payload: z.any(),
});

export const getChatHistoryResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getChatHistoryResponse'),
  chats: z.any(),
});

// Code utils response schemas
export const getAllFilesMarkdownResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getAllFilesMarkdownResponse'),
  markdown: z.string(),
});

export const matchProblemResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('matchProblemResponse'),
  payload: z.any(),
});

export const getMatcherListTreeResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getMatcherListTreeResponse'),
  payload: z.any(),
});

// Debug response schemas
export const debugAddLogResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('debugAddLogResponse'),
  succes: z.literal(true),
});

export const openDebugBrowserResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('openDebugBrowserResponse'),
  succes: z.literal(true),
});

// Browser response schemas
export const newPageResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('newPageResponse'),
});

// Crawler response schemas
export const crawlerResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('crawlerResponse'),
  data: z.any(),
});

// Tree parser response schemas
export const getTreeResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('getTreeResponse'),
  payload: z.any(),
});

// Search response schemas
export const searchFilesResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('searchFilesResponse'),
  success: z.boolean(),
  result: z.any().optional(),
  message: z.string().optional(),
});

export const grepSearchResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('grepSearchResponse'),
  success: z.boolean(),
  result: z.any().optional(),
  message: z.string().optional(),
});

export const fileSearchResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('fileSearchResponse'),
  success: z.boolean(),
  result: z.any().optional(),
  message: z.string().optional(),
});

// Edit file response schema
export const editFileAndApplyDiffResponseSchema = baseResponseMessageSchema.extend({
  type: z.literal('editFileAndApplyDiffResponse'),
  success: z.literal(true),
  result: z.any(),
});

// Union of all response message schemas
export const responseMessageSchema = z.union([
  createFileResponseSchema,
  readFileResponseSchema,
  updateFileResponseSchema,
  deleteFileResponseSchema,
  fileListResponseSchema,
  gitInitResponseSchema,
  gitCommitResponseSchema,
  gitPushResponseSchema,
  gitStatusResponseSchema,
  gitLogsResponseSchema,
  gitDiffResponseSchema,
  getEnabledToolBoxesResponseSchema,
  getAvailableToolBoxesResponseSchema,
  getLocalToolBoxesResponseSchema,
  executeToolResponseSchema,
  addTaskResponseSchema,
  updateTasksResponseSchema,
  deleteTaskResponseSchema,
  createTasksFromMarkdownResponseSchema,
  getAppStateResponseSchema,
  getAgentStateResponseSchema,
  addToAgentStateResponseSchema,
  getProjectPathResponseSchema,
  getProjectSettingsResponseSchema,
  getRepoMapResponseSchema,
  addVectorItemResponseSchema,
  getVectorResponseSchema,
  queryVectorItemResponseSchema,
  addTokenResponseSchema,
  getTokenResponseSchema,
  getSummarizeAllResponseSchema,
  getSummarizeResponseSchema,
  getChatHistoryResponseSchema,
  getAllFilesMarkdownResponseSchema,
  matchProblemResponseSchema,
  getMatcherListTreeResponseSchema,
  debugAddLogResponseSchema,
  openDebugBrowserResponseSchema,
  newPageResponseSchema,
  crawlerResponseSchema,
  getTreeResponseSchema,
  searchFilesResponseSchema,
  grepSearchResponseSchema,
  fileSearchResponseSchema,
  editFileAndApplyDiffResponseSchema,
]);

// Inferred TypeScript types
export type AiRequestStateEnum = z.infer<typeof aiRequestStateEnumSchema>;
export type BaseResponseMessage = z.infer<typeof baseResponseMessageSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// File operation response types
export type CreateFileResponse = z.infer<typeof createFileResponseSchema>;
export type ReadFileResponse = z.infer<typeof readFileResponseSchema>;
export type UpdateFileResponse = z.infer<typeof updateFileResponseSchema>;
export type DeleteFileResponse = z.infer<typeof deleteFileResponseSchema>;
export type FileListResponse = z.infer<typeof fileListResponseSchema>;

// Git response types
export type GitInitResponse = z.infer<typeof gitInitResponseSchema>;
export type GitCommitResponse = z.infer<typeof gitCommitResponseSchema>;
export type GitPushResponse = z.infer<typeof gitPushResponseSchema>;
export type GitStatusResponse = z.infer<typeof gitStatusResponseSchema>;
export type GitLogsResponse = z.infer<typeof gitLogsResponseSchema>;
export type GitDiffResponse = z.infer<typeof gitDiffResponseSchema>;

// MCP response types
export type GetEnabledToolBoxesResponse = z.infer<typeof getEnabledToolBoxesResponseSchema>;
export type GetAvailableToolBoxesResponse = z.infer<typeof getAvailableToolBoxesResponseSchema>;
export type GetLocalToolBoxesResponse = z.infer<typeof getLocalToolBoxesResponseSchema>;
export type ExecuteToolResponse = z.infer<typeof executeToolResponseSchema>;

// All other response types
export type AddTaskResponse = z.infer<typeof addTaskResponseSchema>;
export type GetAppStateResponse = z.infer<typeof getAppStateResponseSchema>;
export type CrawlerResponse = z.infer<typeof crawlerResponseSchema>;
export type ResponseMessage = z.infer<typeof responseMessageSchema>; 