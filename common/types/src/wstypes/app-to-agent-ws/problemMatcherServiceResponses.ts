import { z } from 'zod';

/**
 * Problem Matcher Service Response Schemas
 * Messages sent from problem matcher CLI service back to agents
 */

// Problem match result structure
const ProblemMatchResultSchema = z.object({
    file: z.string().optional(),
    line: z.number().optional(),
    column: z.number().optional(),
    message: z.string().optional(),
    severity: z.string().optional(),
    code: z.string().optional()
}).passthrough(); // Allow additional problem properties

// Matcher definition structure
const MatcherDefinitionSchema = z.object({
    name: z.string().optional(),
    owner: z.string().optional(),
    fileLocation: z.array(z.string()).optional(),
    pattern: z.any().optional()
}).passthrough(); // Allow additional matcher properties

// Base response fields
const BaseResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    timestamp: z.string(),
    requestId: z.string()
});

// Match problem response schema
export const MatchProblemResponseSchema = BaseResponseSchema.extend({
    type: z.literal('matchProblemResponse'),
    matches: z.array(ProblemMatchResultSchema).optional()
});

// Get matcher list response schema
export const GetMatcherListResponseSchema = BaseResponseSchema.extend({
    type: z.literal('getMatcherListTreeResponse'),
    matchers: z.array(MatcherDefinitionSchema).optional()
});

// Get match detail response schema
export const GetMatchDetailResponseSchema = BaseResponseSchema.extend({
    type: z.literal('getMatchDetailResponse'),
    matcher: MatcherDefinitionSchema.optional()
});

// Error response schema
export const ErrorResponseSchema = BaseResponseSchema.extend({
    type: z.literal('error')
});

// Union of all problem matcher service response schemas
export const ProblemMatcherServiceResponseSchema = z.union([
    MatchProblemResponseSchema,
    GetMatcherListResponseSchema,
    GetMatchDetailResponseSchema,
    ErrorResponseSchema
]);

// Export with the expected name for the index file
export const problemMatcherServiceResponseSchema = ProblemMatcherServiceResponseSchema;

// Type exports
export type MatchProblemResponse = z.infer<typeof MatchProblemResponseSchema>;
export type GetMatcherListResponse = z.infer<typeof GetMatcherListResponseSchema>;
export type GetMatchDetailResponse = z.infer<typeof GetMatchDetailResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ProblemMatcherServiceResponse = z.infer<typeof ProblemMatcherServiceResponseSchema>; 