import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Browser Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/browser.ts
 */

// Base browser notification schema
export const browserNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('browsernotify'),
  action: z.string(),
});

// Web Fetch Request
export const webFetchRequestNotificationSchema = browserNotificationBaseSchema.extend({
  action: z.literal('webFetchRequest'),
  data: z.object({
    url: z.string(),
    method: z.string().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
    timeout: z.number().optional(),
  }),
});

// Web Fetch Response
export const webFetchResponseNotificationSchema = browserNotificationBaseSchema.extend({
  action: z.literal('webFetchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    status: z.number().optional(),
    statusText: z.string().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    url: z.string().optional(),
  }).optional(),
});

// Web Search Request
export const webSearchRequestNotificationSchema = browserNotificationBaseSchema.extend({
  action: z.literal('webSearchRequest'),
  data: z.object({
    query: z.string(),
    maxResults: z.number().optional(),
    searchEngine: z.string().optional(),
    filters: z.record(z.string(), z.any()).optional(),
  }),
});

// Web Search Response
export const webSearchResponseNotificationSchema = browserNotificationBaseSchema.extend({
  action: z.literal('webSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
      rank: z.number().optional(),
    })),
    totalResults: z.number().optional(),
    searchTime: z.number().optional(),
  }).optional(),
});

// Union of all browser notification schemas
export const browserNotificationSchema = z.union([
  webFetchRequestNotificationSchema,
  webFetchResponseNotificationSchema,
  webSearchRequestNotificationSchema,
  webSearchResponseNotificationSchema,
]);

// Inferred TypeScript types
export type BrowserNotificationBase = z.infer<typeof browserNotificationBaseSchema>;
export type WebFetchRequestNotification = z.infer<typeof webFetchRequestNotificationSchema>;
export type WebFetchResponseNotification = z.infer<typeof webFetchResponseNotificationSchema>;
export type WebSearchRequestNotification = z.infer<typeof webSearchRequestNotificationSchema>;
export type WebSearchResponseNotification = z.infer<typeof webSearchResponseNotificationSchema>;

// Union types for convenience
export type BrowserNotification = z.infer<typeof browserNotificationSchema>; 