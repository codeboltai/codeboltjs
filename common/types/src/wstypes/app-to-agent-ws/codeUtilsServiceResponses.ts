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
  error: z.string().optional()
});

// Get all files as markdown response schema
export const GetAllFilesAsMarkdownResponseSchema = z.object({
  type: z.literal('getAllFilesAsMarkdownResponse'),
  requestId: z.string(),
  markdown: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Match problem response schema
export const MatchProblemResponseSchema = z.object({
  type: z.literal('matchProblemResponse'),
  requestId: z.string(),
  matches: z.array(z.any()).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get matcher list tree response schema
export const GetMatcherListTreeResponseSchema = z.object({
  type: z.literal('getMatcherListTreeResponse'),
  requestId: z.string(),
  tree: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get match detail response schema
export const GetMatchDetailResponseSchema = z.object({
  type: z.literal('getMatchDetailResponse'),
  requestId: z.string(),
  detail: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all codeutils service response schemas
export const CodeUtilsServiceResponseSchema = z.union([
  GetJsTreeResponseSchema,
  GetAllFilesAsMarkdownResponseSchema,
  MatchProblemResponseSchema,
  GetMatcherListTreeResponseSchema,
  GetMatchDetailResponseSchema
]);

// Export with the expected name for the index file
export const codeUtilsServiceResponseSchema = CodeUtilsServiceResponseSchema;

// Type exports
export type GetJsTreeResponse = z.infer<typeof GetJsTreeResponseSchema>;
export type GetAllFilesAsMarkdownResponse = z.infer<typeof GetAllFilesAsMarkdownResponseSchema>;
export type MatchProblemResponse = z.infer<typeof MatchProblemResponseSchema>;
export type GetMatcherListTreeResponse = z.infer<typeof GetMatcherListTreeResponseSchema>;
export type GetMatchDetailResponse = z.infer<typeof GetMatchDetailResponseSchema>;
export type CodeUtilsServiceResponse = z.infer<typeof CodeUtilsServiceResponseSchema>; 