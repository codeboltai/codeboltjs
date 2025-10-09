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
  currentFile: z.string(),
  mentionedFiles: z.array(z.string()),
  mentionedFolders: z.array(z.string()),
  actions: z.array(z.any()), // Define specific action schema if needed
  mentionedAgents: z.array(z.string()),
  selectedAgent: selectedAgentSchema,
  universalAgentLastMessage: z.string(),
  mentionedMultiFile: z.array(z.string()),
  uploadedImages: z.array(z.string()),
  selection: z.any().nullable(), // Define specific selection schema if needed
  controlFiles: z.array(z.string()),
  feedbackMessage: z.string(),
  links: z.array(z.string()),
  terminalMessage: z.string(),
  messageId: z.string(),
  threadId: z.string(),
  processId: z.string(),
  mentionedMCPs: z.array(z.string()),
  mentionedDocs: z.array(z.string()),
  activeFile: z.string(),
  openedFiles: z.array(z.string()),
  agentInstanceId: z.string(),
  agentId: z.string(),
});

// TypeScript type
export type CommandConfirmation = z.infer<typeof commandConfirmationSchema>;
export type SelectedAgent = z.infer<typeof selectedAgentSchema>;
export type AgentLastMessage = z.infer<typeof agentLastMessageSchema>;