import { z } from 'zod';

/**
 * Chat History Service Response Schemas
 * Messages sent from chat history CLI service back to agents
 */

// Message schema (from llmmessage.ts interface)
const MessageSchema = z.object({
    role: z.string(),
    content: z.string()
});

// Get chat history response schema
// Returns ChatMessage[] from getChatHistory()
export const ChatHistoryResponseSchema = z.object({
    type: z.literal('getChatHistoryResponse'),
    requestId: z.string(),
    messages: z.array(z.object({
        id: z.string().optional(),
        content: z.string(),
        sender: z.string(),
        timestamp: z.string(),
        type: z.string(),
        role: z.enum(['user', 'assistant', 'system']).optional(),
        metadata: z.record(z.any()).optional()
    })).optional(),
    agentId: z.string().optional(),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional()
});

// Wait for reply response schema
// Returns UserMessage from waitforReply()
export const WaitForReplyResponseSchema = z.object({
    type: z.literal('waitFormessageResponse'),
    requestId: z.string(),
    message: z.object({
        type: z.literal('messageResponse'),
        userMessage: z.string(),
        currentFile: z.string(),
        selectedAgent: z.object({
            id: z.string(),
            name: z.string(),
            lastMessage: z.record(z.any())
        }),
        mentionedFiles: z.array(z.string()),
        mentionedFullPaths: z.array(z.string()),
        mentionedFolders: z.array(z.string()),
        mentionedMultiFile: z.array(z.string()),
        mentionedMCPs: z.array(z.string()),
        uploadedImages: z.array(z.string()),
        actions: z.array(z.any()),
        mentionedAgents: z.array(z.any()),
        mentionedDocs: z.array(z.any()),
        links: z.array(z.any()),
        universalAgentLastMessage: z.string(),
        selection: z.any().nullable(),
        controlFiles: z.array(z.any()),
        feedbackMessage: z.string(),
        terminalMessage: z.string(),
        threadId: z.string(),
        processId: z.string(),
        shadowGitHash: z.string()
    }),
    sender: z.object({
        senderType: z.string(),
        senderInfo: z.record(z.any())
    }),
    templateType: z.string(),
    data: z.object({
        text: z.string()
    }).and(z.record(z.any())),
    timestamp: z.string()
});

// Confirmation response schema
// Returns string from sendConfirmationRequest() and askQuestion()
export const ConfirmationResponseSchema = z.object({
    type: z.literal('confirmationResponse'),
    requestId: z.string(),
    answer: z.string(),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional()
});

// Feedback response schema
// Alternative response for confirmation requests with feedback
export const FeedbackResponseSchema = z.object({
    type: z.literal('feedbackResponse'),
    requestId: z.string(),
    feedback: z.string(),
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional()
});

// Get summarize all response schema
// Returns summary from summarize_all() which returns Message[] | null
export const GetSummarizeAllResponseSchema = z.object({
    type: z.literal('getSummarizeAllResponse'),
    payload: z.array(MessageSchema).nullable()
});

// Get summarize response schema  
// Returns summary from summarize() which returns Message[]
export const GetSummarizeResponseSchema = z.object({
    type: z.literal('getSummarizeResponse'),
    payload: z.array(MessageSchema)
});

// Union of all chat history service response schemas
export const ChatHistoryServiceResponseSchema = z.union([
    ChatHistoryResponseSchema,
    WaitForReplyResponseSchema,
    ConfirmationResponseSchema,
    FeedbackResponseSchema,
    GetSummarizeAllResponseSchema,
    GetSummarizeResponseSchema
]);

// Export with the expected name for the index file
export const chatHistoryServiceResponseSchema = ChatHistoryServiceResponseSchema;

// Type exports
export type Message = z.infer<typeof MessageSchema>;
export type ChatHistoryResponse = z.infer<typeof ChatHistoryResponseSchema>;
export type WaitForReplyResponse = z.infer<typeof WaitForReplyResponseSchema>;
export type ConfirmationResponse = z.infer<typeof ConfirmationResponseSchema>;
export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;
export type GetSummarizeAllResponse = z.infer<typeof GetSummarizeAllResponseSchema>;
export type GetSummarizeResponse = z.infer<typeof GetSummarizeResponseSchema>;
export type ChatHistoryServiceResponse = z.infer<typeof ChatHistoryServiceResponseSchema>;
