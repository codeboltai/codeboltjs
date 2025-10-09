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

// Command confirmation response schema
export const commandConfirmationSchema = z.object({
  type: z.literal('commandconfirmation'),
  userMessage: z.string(),
  action: z.string(),
  path: z.string(),
  messageId: z.string(),
  threadId: z.string(),
  processId: z.string(),
  agentInstanceId: z.string(),
  agentId: z.string(),
});

// TypeScript type
export type CommandConfirmation = z.infer<typeof commandConfirmationSchema>;
export type SelectedAgent = z.infer<typeof selectedAgentSchema>;
export type AgentLastMessage = z.infer<typeof agentLastMessageSchema>;