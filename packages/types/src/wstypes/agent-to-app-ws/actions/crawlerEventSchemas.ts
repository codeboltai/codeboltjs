import { z } from 'zod';

/**
 * Crawler Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/crawler.ts module operations
 */

// Base crawler message schema
export const crawlerEventBaseSchema = z.object({
  type: z.literal('crawlerEvent'),
  action: z.string(),
  requestId: z.string(),
});

// Start Crawler Event Schema
export const startCrawlerEventSchema = crawlerEventBaseSchema.extend({
  action: z.literal('start'),
});

// Crawler Screenshot Event Schema
export const crawlerScreenshotEventSchema = crawlerEventBaseSchema.extend({
  action: z.literal('screenshot'),
});

// Crawler Go To Page Event Schema
export const crawlerGoToPageEventSchema = crawlerEventBaseSchema.extend({
  action: z.literal('goToPage'),
  url: z.string(),
});

// Crawler Scroll Event Schema
export const crawlerScrollEventSchema = crawlerEventBaseSchema.extend({
  action: z.literal('scroll'),
  direction: z.string(),
});

// Crawler Click Event Schema
export const crawlerClickEventSchema = crawlerEventBaseSchema.extend({
  action: z.literal('click'),
  id: z.string(),
});

// Union of all crawler event schemas
export const crawlerEventSchema = z.union([
  startCrawlerEventSchema,
  crawlerScreenshotEventSchema,
  crawlerGoToPageEventSchema,
  crawlerScrollEventSchema,
  crawlerClickEventSchema,
]);

// Inferred TypeScript types for events
export type CrawlerEventBase = z.infer<typeof crawlerEventBaseSchema>;
export type StartCrawlerEvent = z.infer<typeof startCrawlerEventSchema>;
export type CrawlerScreenshotEvent = z.infer<typeof crawlerScreenshotEventSchema>;
export type CrawlerGoToPageEvent = z.infer<typeof crawlerGoToPageEventSchema>;
export type CrawlerScrollEvent = z.infer<typeof crawlerScrollEventSchema>;
export type CrawlerClickEvent = z.infer<typeof crawlerClickEventSchema>;
export type CrawlerEvent = z.infer<typeof crawlerEventSchema>;

