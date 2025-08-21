import { z } from 'zod';

/**
 * Tokenizer Service Response Schemas
 * Messages sent from tokenizer CLI service back to agents
 */

// Add token response schema
export const AddTokenResponseSchema = z.object({
  type: z.literal('addTokenResponse'),
  token: z.string().optional(),
  count: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get token response schema
export const GetTokenResponseSchema = z.object({
  type: z.literal('getTokenResponse'),
  tokens: z.array(z.string()).optional(),
  count: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all tokenizer service response schemas
export const TokenizerServiceResponseSchema = z.union([
  AddTokenResponseSchema,
  GetTokenResponseSchema
]);

// Export with the expected name for the index file
export const tokenizerServiceResponseSchema = TokenizerServiceResponseSchema;

// Type exports
export type AddTokenResponse = z.infer<typeof AddTokenResponseSchema>;
export type GetTokenResponse = z.infer<typeof GetTokenResponseSchema>;
export type TokenizerServiceResponse = z.infer<typeof TokenizerServiceResponseSchema>; 