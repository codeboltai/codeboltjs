import { z } from 'zod';

/**
 * Code Utils Service Response Schemas
 * Messages sent from codeutils CLI service back to agents
 */

// Get JS tree response schema
export const GetJsTreeResponseSchema = z.object({
  type: z.literal('getJsTreeResponse'),
  requestId: z.string(),
  filePath: z.string().optional(),
  structure: z.array(z.object({
    type: z.string(),
    name: z.string(),
    startLine: z.number(),
    endLine: z.number(),
    startColumn: z.number(),
    endColumn: z.number(),
    nodeType: z.string()
  })).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional()
});

// Get all files as markdown response schema
export const GetAllFilesAsMarkdownResponseSchema = z.object({
  type: z.literal('getAllFilesAsMarkdownResponse'),
  requestId: z.string(),
  markdown: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    language: z.string()
  })).optional()
});

// Match problem response schema
export const MatchProblemResponseSchema = z.object({
  type: z.literal('matchProblemResponse'),
  requestId: z.string(),
  matches: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional()
});

// Get matcher list tree response schema
export const GetMatcherListTreeResponseSchema = z.object({
  type: z.literal('getMatcherListTreeResponse'),
  requestId: z.string(),
  tree: z.any().optional(),
  matchers: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional()
});

// Get match detail response schema
export const GetMatchDetailResponseSchema = z.object({
  type: z.literal('getMatchDetailResponse'),
  requestId: z.string(),
  detail: z.any().optional(),
  matcher: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional()
});

// Code Utils error response schema
export const CodeUtilsServiceErrorResponseSchema = z.object({
  type: z.literal('error'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Code Utils success response schema
export const CodeUtilsOperationSuccessResponseSchema = z.object({
  type: z.literal('codeUtilsOperationSuccessResponse'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Union of all codeutils service response schemas
export const CodeUtilsServiceResponseSchema = z.union([
  GetJsTreeResponseSchema,
  GetAllFilesAsMarkdownResponseSchema,
  MatchProblemResponseSchema,
  GetMatcherListTreeResponseSchema,
  GetMatchDetailResponseSchema,
  CodeUtilsServiceErrorResponseSchema,
  CodeUtilsOperationSuccessResponseSchema
]);

// Export with the expected name for the index file
export const codeUtilsServiceResponseSchema = CodeUtilsServiceResponseSchema;

// Type exports
export type GetJsTreeResponse = z.infer<typeof GetJsTreeResponseSchema>;
export type GetAllFilesMarkdownResponse = z.infer<typeof GetAllFilesAsMarkdownResponseSchema>;
export type CodeUtilsMatchProblemResponse = z.infer<typeof MatchProblemResponseSchema>;
export type GetMatcherListTreeResponse = z.infer<typeof GetMatcherListTreeResponseSchema>;
export type GetMatchDetailResponse = z.infer<typeof GetMatchDetailResponseSchema>;
export type CodeUtilsOperationErrorResponse = z.infer<typeof CodeUtilsServiceErrorResponseSchema>;
export type CodeUtilsOperationSuccessResponse = z.infer<typeof CodeUtilsOperationSuccessResponseSchema>;
export type CodeUtilsServiceResponse = z.infer<typeof CodeUtilsServiceResponseSchema>; 