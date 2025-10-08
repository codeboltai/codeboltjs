import { z } from 'zod';
import { baseMessageSchema } from './coreMessageSchemas';

/**
 * Crawler Service Message Schemas
 * Based on crawlerService.cli.ts
 */

// Crawler response schema
export const crawlerResponseSchema = z.object({
  type: z.literal('crawlerResponse'),
  data: z.any(),
});

// Crawler MCP tool execution schemas
export const crawlerMcpToolConfirmationSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('crawler'),
    toolName: z.string(),
    serverName: z.literal('codebolt-crawler'),
    params: z.any(),
    stateEvent: z.literal('ASK_FOR_CONFIRMATION'),
  }),
});

export const crawlerMcpToolExecutingSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('crawler'),
    toolName: z.string(),
    serverName: z.literal('codebolt-crawler'),
    params: z.any(),
    stateEvent: z.literal('EXECUTING'),
  }),
});

export const crawlerMcpToolSuccessSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('crawler'),
    toolName: z.string(),
    serverName: z.literal('codebolt-crawler'),
    params: z.any(),
    result: z.any(),
    stateEvent: z.literal('EXECUTION_SUCCESS'),
  }),
});

export const crawlerMcpToolErrorSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('crawler'),
    toolName: z.string(),
    serverName: z.literal('codebolt-crawler'),
    params: z.any(),
    result: z.string(),
    stateEvent: z.literal('EXECUTION_ERROR'),
  }),
});

export const crawlerMcpToolRejectedSchema = baseMessageSchema.extend({
  type: z.literal('message'),
  actionType: z.literal('MCP_TOOL'),
  templateType: z.literal('MCP_TOOL'),
  payload: z.object({
    type: z.literal('crawler'),
    toolName: z.string(),
    serverName: z.literal('codebolt-crawler'),
    params: z.any(),
    stateEvent: z.literal('REJECTED'),
  }),
});


export const crawlerErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});
// Union of all crawler service schemas
export const crawlerServiceMessageSchema = z.union([
  crawlerErrorResponseSchema,
  crawlerResponseSchema,
  crawlerMcpToolConfirmationSchema,
  crawlerMcpToolExecutingSchema,
  crawlerMcpToolSuccessSchema,
  crawlerMcpToolErrorSchema,
  crawlerMcpToolRejectedSchema,
]);

// TypeScript types
export type CrawlerResponse = z.infer<typeof crawlerResponseSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerMcpToolConfirmation = z.infer<typeof crawlerMcpToolConfirmationSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerMcpToolExecuting = z.infer<typeof crawlerMcpToolExecutingSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerMcpToolSuccess = z.infer<typeof crawlerMcpToolSuccessSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerMcpToolError = z.infer<typeof crawlerMcpToolErrorSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerMcpToolRejected = z.infer<typeof crawlerMcpToolRejectedSchema>;
export type CrawlerErrorResponse = z.infer<typeof crawlerErrorResponseSchema>;export type CrawlerServiceMessage = z.infer<typeof crawlerServiceMessageSchema>; 