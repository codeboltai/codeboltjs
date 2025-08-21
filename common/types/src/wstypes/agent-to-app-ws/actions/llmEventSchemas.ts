import { z } from 'zod';

/**
 * LLM Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/llm.ts module operations
 */

// Base message schema for LLM operations (used in modern inference)
const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.union([
    z.string(),
    z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
      image_url: z.object({
        url: z.string(),
      }).optional(),
    })),
  ]),
  name: z.string().optional(),
  tool_calls: z.array(z.object({
    id: z.string(),
    type: z.string(),
    function: z.object({
      name: z.string(),
      arguments: z.string(),
    }),
  })).optional(),
  tool_call_id: z.string().optional(),
});

// Tool schema for function calling
const toolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.record(z.any()),
      required: z.array(z.string()).optional(),
    }),
  }),
});

// LLM inference parameters schema (used in modern inference)
const llmInferenceParamsSchema = z.object({
  messages: z.array(messageSchema),
  tools: z.array(toolSchema).optional(),
  tool_choice: z.union([
    z.literal('none'),
    z.literal('auto'),
    z.object({
      type: z.literal('function'),
      function: z.object({
        name: z.string(),
      }),
    }),
  ]).optional(),
  full: z.boolean().optional(),
  max_tokens: z.number().optional(),
  temperature: z.number().optional(),
  stream: z.boolean().optional(),
});

// Base LLM event schema
export const llmEventBaseSchema = z.object({
  type: z.literal('inference'),
  requestId: z.string(),
  message: z.object({
    prompt: z.union([llmInferenceParamsSchema, z.string()]),
    llmrole: z.string().optional(),
  }),
});

// Modern inference event schema with full OpenAI format
export const inferenceEventSchema = llmEventBaseSchema.extend({
  message: z.object({
    prompt: llmInferenceParamsSchema,
    llmrole: z.string().optional(),
  }),
});

// Legacy inference event schema for backward compatibility
export const legacyInferenceEventSchema = llmEventBaseSchema.extend({
  message: z.object({
    prompt: z.string(),
    llmrole: z.string(),
  }),
});

// Union of all LLM event schemas
export const llmEventSchema = z.union([
  inferenceEventSchema,
  legacyInferenceEventSchema,
]);

// Inferred TypeScript types for LLM operations
export type Message = z.infer<typeof messageSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type LLMInferenceParams = z.infer<typeof llmInferenceParamsSchema>;

// Inferred TypeScript types for events
export type LLMEventBase = z.infer<typeof llmEventBaseSchema>;
export type InferenceEvent = z.infer<typeof inferenceEventSchema>;
export type LegacyInferenceEvent = z.infer<typeof legacyInferenceEventSchema>;
export type LLMEvent = z.infer<typeof llmEventSchema>;

