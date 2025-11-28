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
  error: z.string().optional(),
  timestamp: z.string().optional(),
  url: z.string().optional(),
  content: z.string().optional(),
  links: z.array(z.any()).optional()
});

// Crawler error response schema
export const CrawlerServiceErrorResponseSchema = z.object({
  type: z.literal('error'),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional()
});

// Union of all crawler service response schemas
export const CrawlerServiceResponseSchema = z.union([
  CrawlResponseSchema,
  CrawlerServiceErrorResponseSchema
]);

// Export with the expected name for the index file
export const crawlerServiceResponseSchema = CrawlerServiceResponseSchema;

// Type exports
export type CrawlResponse = z.infer<typeof CrawlResponseSchema>;
export type CrawlerServiceErrorResponse = z.infer<typeof CrawlerServiceErrorResponseSchema>;
export type CrawlerServiceResponse = z.infer<typeof CrawlerServiceResponseSchema>; 