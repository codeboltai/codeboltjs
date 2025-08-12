import { z } from 'zod';

/**
 * Crawler Service Response Schemas
 * Messages sent from crawler CLI service back to agents
 */

// Crawl response schema
export const CrawlResponseSchema = z.object({
  type: z.literal('crawlResponse'),
  requestId: z.string(),
  action: z.string().optional(),
  result: z.any().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all crawler service response schemas
export const CrawlerServiceResponseSchema = CrawlResponseSchema;

// Export with the expected name for the index file
export const crawlerServiceResponseSchema = CrawlerServiceResponseSchema;

// Type exports
export type CrawlResponse = z.infer<typeof CrawlResponseSchema>;
export type CrawlerServiceResponse = z.infer<typeof CrawlerServiceResponseSchema>; 