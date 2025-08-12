import { z } from 'zod';

/**
 * Git Service Response Schemas
 * Messages sent from git CLI service back to agents
 */

// Git init response schema
export const GitInitResponseSchema = z.object({
  type: z.literal('gitInitResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git pull response schema
export const GitPullResponseSchema = z.object({
  type: z.literal('PullResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git push response schema
export const GitPushResponseSchema = z.object({
  type: z.literal('PushResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git status response schema
export const GitStatusResponseSchema = z.object({
  type: z.literal('gitStatusResponse'),
  requestId: z.string(),
  status: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git add response schema
export const GitAddResponseSchema = z.object({
  type: z.literal('AddResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git commit response schema
export const GitCommitResponseSchema = z.object({
  type: z.literal('gitCommitResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git checkout response schema
export const GitCheckoutResponseSchema = z.object({
  type: z.literal('gitCheckoutResponse'),
  requestId: z.string(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git branch response schema
export const GitBranchResponseSchema = z.object({
  type: z.literal('gitBranchResponse'),
  requestId: z.string(),
  branches: z.array(z.string()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git logs response schema
export const GitLogsResponseSchema = z.object({
  type: z.literal('gitLogsResponse'),
  requestId: z.string(),
  logs: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Git diff response schema
export const GitDiffResponseSchema = z.object({
  type: z.literal('gitDiffResponse'),
  requestId: z.string(),
  diff: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all git service response schemas
export const GitServiceResponseSchema = z.union([
  GitInitResponseSchema,
  GitPullResponseSchema,
  GitPushResponseSchema,
  GitStatusResponseSchema,
  GitAddResponseSchema,
  GitCommitResponseSchema,
  GitCheckoutResponseSchema,
  GitBranchResponseSchema,
  GitLogsResponseSchema,
  GitDiffResponseSchema
]);

// Export with the expected name for the index file
export const gitServiceResponseSchema = GitServiceResponseSchema;

// Type exports
export type GitInitResponse = z.infer<typeof GitInitResponseSchema>;
export type GitPullResponse = z.infer<typeof GitPullResponseSchema>;
export type GitPushResponse = z.infer<typeof GitPushResponseSchema>;
export type GitStatusResponse = z.infer<typeof GitStatusResponseSchema>;
export type GitAddResponse = z.infer<typeof GitAddResponseSchema>;
export type GitCommitResponse = z.infer<typeof GitCommitResponseSchema>;
export type GitCheckoutResponse = z.infer<typeof GitCheckoutResponseSchema>;
export type GitBranchResponse = z.infer<typeof GitBranchResponseSchema>;
export type GitLogsResponse = z.infer<typeof GitLogsResponseSchema>;
export type GitDiffResponse = z.infer<typeof GitDiffResponseSchema>;
export type GitServiceResponse = z.infer<typeof GitServiceResponseSchema>; 