import { z } from 'zod';

/**
 * Message Event Schemas for Agent-to-App Communication
 * Based on CodeBolt messageService.cli.ts operations
 */

// Base message schema
export const messageEventBaseSchema = z.object({
    type: z.string(), // WebSocketMessageType
    action: z.string().optional(),
    requestId: z.string(),
    agentId: z.string().optional(),
    threadId: z.string().optional(),
    agentInstanceId: z.string().optional(),
    parentAgentInstanceId: z.string().optional(),
    parentId: z.string().optional(),
});

// Send Message Options Schema
const sendMessageOptionsSchema = z.object({
    message: z.string(),
    type: z.string().optional(),
});

// Process Started Options Schema
const processStartedOptionsSchema = z.object({
    message: z.string(),
});

// Process Stopped Options Schema
const processStoppedOptionsSchema = z.object({
    message: z.string(),
});

// Confirmation Request Options Schema
const confirmationRequestOptionsSchema = z.object({
    message: z.string(),
    buttons: z.array(z.any()).optional(),
    withFeedback: z.boolean().optional(),
});

// Wait For Reply Options Schema
const waitForReplyOptionsSchema = z.object({
    message: z.string(),
});

// Send Message Event Schema
export const sendMessageEventSchema = messageEventBaseSchema.extend({
    type: z.literal('sendMessage'),
    message: z.union([z.string(), z.any()]), // Can be string or object
});

// Process Started Event Schema
export const processStartedEventSchema = messageEventBaseSchema.extend({
    type: z.literal('processStarted'),
    message: z.union([z.string(), z.any()]),
});

// Process Stopped Event Schema
export const processStoppedEventSchema = messageEventBaseSchema.extend({
    type: z.literal('processStoped'), // Matches WebSocketMessageType.ProcessStoped
    message: z.union([z.string(), z.any()]),
});

// Confirmation Request Event Schema
export const confirmationRequestEventSchema = messageEventBaseSchema.extend({
    type: z.literal('confirmationRequest'),
    message: z.union([z.string(), z.any()]),
    buttons: z.array(z.any()).optional(),
    withFeedback: z.boolean().optional(),
});

// Wait For Reply Event Schema
export const waitForReplyEventSchema = messageEventBaseSchema.extend({
    type: z.literal('waitforReply'), // Matches WebSocketMessageType.WaitForReply
    message: z.union([z.string(), z.any()]),
});

// Union of all message event schemas
export const messageEventSchema = z.union([
    sendMessageEventSchema,
    processStartedEventSchema,
    processStoppedEventSchema,
    confirmationRequestEventSchema,
    waitForReplyEventSchema,
]);

// Inferred TypeScript types for events
export type MessageEventBase = z.infer<typeof messageEventBaseSchema>;
export type SendMessageEvent = z.infer<typeof sendMessageEventSchema>;
export type ProcessStartedEvent = z.infer<typeof processStartedEventSchema>;
export type ProcessStoppedEvent = z.infer<typeof processStoppedEventSchema>;
export type ConfirmationRequestEvent = z.infer<typeof confirmationRequestEventSchema>;
export type WaitForReplyEvent = z.infer<typeof waitForReplyEventSchema>;
export type MessageEvent = z.infer<typeof messageEventSchema>;
