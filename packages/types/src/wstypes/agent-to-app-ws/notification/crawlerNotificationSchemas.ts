import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Crawler Notification Schemas for Agent-to-App Communication
 * Based on notification types in src/types/notification/crawler.ts
 */

// Base crawler notification schema
export const crawlerNotificationBaseSchema = AgentMessageBaseSchema.extend({
  toolUseId: z.string(),
  type: z.literal('crawlernotify'),
  action: z.string(),
});

// Crawler Search Request
export const crawlerSearchRequestNotificationSchema = crawlerNotificationBaseSchema.extend({
  action: z.literal('crawlerSearchRequest'),
  data: z.object({
    url: z.string(),
    searchQuery: z.string().optional(),
    maxDepth: z.number().optional(),
    maxPages: z.number().optional(),
    includeSubdomains: z.boolean().optional(),
    followRedirects: z.boolean().optional(),
  }),
});

// Crawler Search Response
export const crawlerSearchResponseNotificationSchema = crawlerNotificationBaseSchema.extend({
  action: z.literal('crawlerSearchResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    pages: z.array(z.object({
      url: z.string(),
      title: z.string(),
      content: z.string(),
      depth: z.number(),
      timestamp: z.string(),
    })),
    totalPages: z.number().optional(),
    crawlTime: z.number().optional(),
  }).optional(),
});

// Crawler Start Request
export const crawlerStartRequestNotificationSchema = crawlerNotificationBaseSchema.extend({
  action: z.literal('crawlerStartRequest'),
  data: z.object({
    startUrl: z.string(),
    options: z.object({
      userAgent: z.string().optional(),
      timeout: z.number().optional(),
      headers: z.record(z.string(), z.string()).optional(),
    }).optional(),
  }),
});

// Crawler Start Response
export const crawlerStartResponseNotificationSchema = crawlerNotificationBaseSchema.extend({
  action: z.literal('crawlerStartResult'),
  content: z.union([z.string(), z.any()]),
  isError: z.boolean().optional(),
  data: z.object({
    sessionId: z.string(),
    status: z.string(),
  }).optional(),
});

// Union of all crawler notification schemas
export const crawlerNotificationSchema = z.union([
  crawlerSearchRequestNotificationSchema,
  crawlerSearchResponseNotificationSchema,
  crawlerStartRequestNotificationSchema,
  crawlerStartResponseNotificationSchema,
]);

// Inferred TypeScript types
export type CrawlerNotificationBase = z.infer<typeof crawlerNotificationBaseSchema>;
export type CrawlerSearchRequestNotification = z.infer<typeof crawlerSearchRequestNotificationSchema>;
export type CrawlerSearchResponseNotification = z.infer<typeof crawlerSearchResponseNotificationSchema>;
export type CrawlerStartRequestNotification = z.infer<typeof crawlerStartRequestNotificationSchema>;
export type CrawlerStartResponseNotification = z.infer<typeof crawlerStartResponseNotificationSchema>;

// Union types for convenience
export type CrawlerNotification = z.infer<typeof crawlerNotificationSchema>; 