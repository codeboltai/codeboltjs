import { z } from 'zod';

/**
 * LLM Service Response Schemas
 * Messages sent from LLM CLI service back to agents
 */

// LLM response schema
export const LLMResponseSchema = z.object({
  type: z.literal('llmResponse'),
  content: z.string(),
  role: z.literal('assistant'),
  model: z.string().optional(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number()
  }).optional(),
  finish_reason: z.string().optional(),
  choices: z.array(z.object({
    message: z.object({
      role: z.string(),
      content: z.string()
    }),
    finish_reason: z.string()
  })).optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all LLM service response schemas
export const LLMServiceResponseSchema = LLMResponseSchema;

// Export with the expected name for the index file
export const llmServiceResponseSchema = LLMServiceResponseSchema;

// Type exports
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
export type LLMServiceResponse = z.infer<typeof LLMServiceResponseSchema>; 