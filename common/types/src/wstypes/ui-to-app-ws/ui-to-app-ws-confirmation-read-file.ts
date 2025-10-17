import { z } from 'zod';

// Agent last message schema
export const agentLastMessageSchema = z.object({
  // Add specific fields based on what lastMessage contains
}).passthrough(); // Allow additional fields

// Selected agent schema
export const selectedAgentSchema = z.object({
  name: z.string(),
  lastMessage: agentLastMessageSchema,
});

// Confirmation response schema
export const confirmationResponseSchema = z.object({
  type: z.literal('confirmationResponse'),
  userMessage: z.string(),
  action: z.string(),
  path: z.string(),
  messageId: z.string(),
  threadId: z.string(),
  processId: z.string().optional(),
  agentInstanceId: z.string(),
  agentId: z.string(),
});

// TypeScript type
export type ConfirmationResponse = z.infer<typeof confirmationResponseSchema>;
export type SelectedAgent = z.infer<typeof selectedAgentSchema>;
export type AgentLastMessage = z.infer<typeof agentLastMessageSchema>;