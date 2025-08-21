// Re-export all service response schemas and types
export * from './browserServiceResponses';
export * from './chatHistoryServiceResponses';
export * from './terminalServiceResponses';
export * from './projectServiceResponses';
export * from './taskServiceResponses';
export * from './llmServiceResponses';
export * from './stateServiceResponses';
export * from './vectordbServiceResponses';
export * from './utilsServiceResponses';
export * from './tokenizerServiceResponses';
export * from './mcpServiceResponses';
export * from './debugServiceResponses';
export * from './dbMemoryServiceResponses';
export * from './codeUtilsServiceResponses';
export * from './crawlerServiceResponses';
export * from './fsServiceResponses';
export * from './gitServiceResponses';
export * from './agentServiceResponses';

// Original index service response schemas
import { z } from 'zod';

/**
 * Index Service Response Schemas
 * Messages sent from index CLI service back to agents
 */

// Chat message schema (basic structure for chat history)
const ChatSchema = z.object({
    type: z.string(),
    requestId: z.string(),
    messageHistory: z.array(z.unknown()).optional()
}).passthrough(); // Allow additional properties

// Get chat history response schema
export const GetChatHistoryResponseSchema = z.object({
    type: z.literal('getChatHistoryResponse'),
    chats: z.array(ChatSchema)
});

// Error response schema
export const ErrorResponseSchema = z.object({
    type: z.literal('error'),
    message: z.string()
});

// Union of all index service response schemas
export const IndexServiceResponseSchema = z.union([
    GetChatHistoryResponseSchema,
    ErrorResponseSchema
]);

// Export with the expected name for the index file
export const indexServiceResponseSchema = IndexServiceResponseSchema;

// Type exports
export type Chat = z.infer<typeof ChatSchema>;
export type GetChatHistoryResponse = z.infer<typeof GetChatHistoryResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type IndexServiceResponse = z.infer<typeof IndexServiceResponseSchema>; 