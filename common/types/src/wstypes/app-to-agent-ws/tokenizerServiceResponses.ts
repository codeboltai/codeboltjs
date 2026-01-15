import { z } from 'zod';

/**
 * Tokenizer Service Response Schemas
 * Messages sent from tokenizer CLI service back to agents
 */

// Add token response schema
export const AddTokenResponseSchema = z.object({
  type: z.literal('addTokenResponse'),
  success: z.boolean(),
  message: z.string(),
  token: z.string(),
  count: z.number(),
  timestamp: z.string(),
  requestId: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get token response schema
export const GetTokenResponseSchema = z.object({
  type: z.literal('getTokenResponse'),
  success: z.boolean(),
  message: z.string(),
  tokens: z.array(z.string()),
  timestamp: z.string(),
  requestId: z.string(),
  count: z.number().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Error response schema
export const TokenizerErrorResponseSchema = z.object({
  type: z.literal('error'),
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
  timestamp: z.string(),
  requestId: z.string()
});

// Union of all tokenizer service response schemas
export const TokenizerServiceResponseSchema = z.union([
  AddTokenResponseSchema,
  GetTokenResponseSchema,
  TokenizerErrorResponseSchema
]);

// Export with the expected name for the index file
export const tokenizerServiceResponseSchema = TokenizerServiceResponseSchema;

// Type exports
export type AddTokenResponse = z.infer<typeof AddTokenResponseSchema>;
export type GetTokenResponse = z.infer<typeof GetTokenResponseSchema>;
export type TokenizerErrorResponse = z.infer<typeof TokenizerErrorResponseSchema>;
export type TokenizerServiceResponse = z.infer<typeof TokenizerServiceResponseSchema>; 