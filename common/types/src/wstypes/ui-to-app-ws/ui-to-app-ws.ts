
import { z } from 'zod';

export const WaitForReplyResponseSchema = z.object({
    type: z.literal('messageResponse'),
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