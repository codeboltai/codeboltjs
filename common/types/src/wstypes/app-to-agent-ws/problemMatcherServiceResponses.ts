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

// Match problem response schema
export const MatchProblemResponseSchema = z.object({
    type: z.literal('matchProblemResponse'),
    payload: z.array(ProblemMatchResultSchema)
});

// Union of all problem matcher service response schemas
export const ProblemMatcherServiceResponseSchema = MatchProblemResponseSchema;

// Export with the expected name for the index file
export const problemMatcherServiceResponseSchema = ProblemMatcherServiceResponseSchema;

// Type exports
export type MatchProblemResponse = z.infer<typeof MatchProblemResponseSchema>;
export type ProblemMatcherServiceResponse = z.infer<typeof ProblemMatcherServiceResponseSchema>; 