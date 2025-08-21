import { z } from 'zod';

/**
 * Browser Service Response Schemas
 * Messages sent from browser CLI service back to agents
 */

// Browser Action Response Data - matches BrowserActionResponseData from codeboltjs
export const BrowserActionResponseDataSchema = z.object({
  type: z.union([
    z.literal('browserActionResponse'),
    z.literal('screenshotResponse'),
    z.literal('getContentResponse'),
    z.literal('getMarkdownResponse'),
    z.literal('getBrowserInfoResponse'),
    z.literal('getSnapShotResponse'),
    z.literal('goToPageResponse'),
    z.literal('goBackResponse'),
    z.literal('goForwardResponse'),
    z.literal('refreshResponse'),
    z.literal('getHTMLResponse'),
    z.literal('extractTextResponse'),
    z.literal('newPageResponse'),
    z.literal('scrollResponse'),
    z.literal('typeResponse'),
    z.literal('clickResponse'),
    z.literal('EnterResponse'),
    z.literal('searchResponse'),
    z.literal('getUrlResponse')
  ]),
  requestId: z.string(),
  payload: z.object({
    action: z.string().optional(),
    success: z.boolean().optional(),
    content: z.string().optional(),
    html: z.string().optional(),
    markdown: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    viewport: z.any().optional(),
    info: z.any().optional(),
    tree: z.any().optional(),
    screenshot: z.string().optional(),
    pdf: z.any().optional(),
    elements: z.array(z.object({
      id: z.string(),
      tag: z.string(),
      text: z.string(),
      attributes: z.record(z.string())
    })).optional(),
    selector: z.string().optional(),
    fullPage: z.boolean().optional(),
    options: z.record(z.any()).optional()
  }).optional(),
  eventId: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// New page response schema - uses BrowserActionResponseData
export const NewPageResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('newPageResponse')
});

// Scroll response schema - uses BrowserActionResponseData
export const ScrollResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('scrollResponse')
});

// Type response schema - uses BrowserActionResponseData
export const TypeResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('typeResponse')
});

// Click response schema - uses BrowserActionResponseData
export const ClickResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('clickResponse')
});

// Enter response schema - uses BrowserActionResponseData
export const EnterResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('EnterResponse')
});

// Search response schema - uses BrowserActionResponseData
export const SearchResponseSchema = BrowserActionResponseDataSchema.extend({
  type: z.literal('searchResponse')
});

// Get URL response schema - matches UrlResponse from codeboltjs
export const GetUrlResponseSchema = z.object({
  type: z.literal('getUrlResponse'),
  requestId: z.string(),
  url: z.string().optional(),
  currentUrl: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Go to page response schema - matches GoToPageResponse from codeboltjs
export const GoToPageResponseSchema = z.object({
  type: z.literal('goToPageResponse'),
  url: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Screenshot response schema - matches BrowserScreenshotResponse from codeboltjs
export const ScreenshotResponseSchema = z.object({
  type: z.literal('screenshotResponse'),
  payload: z.object({
    screenshot: z.string().optional(),
    fullPage: z.boolean().optional(),
    action: z.string().optional(),
    success: z.boolean().optional(),
    content: z.string().optional(),
    html: z.string().optional(),
    markdown: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    viewport: z.any().optional(),
    info: z.any().optional(),
    tree: z.any().optional(),
    pdf: z.any().optional(),
    elements: z.array(z.object({
      id: z.string(),
      tag: z.string(),
      text: z.string(),
      attributes: z.record(z.string())
    })).optional(),
    selector: z.string().optional(),
    options: z.record(z.any()).optional()
  }).optional(),
  eventId: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// HTML received response schema - matches HtmlReceived from codeboltjs
export const HtmlReceivedSchema = z.object({
  type: z.literal('htmlReceived'),
  html: z.string().optional(),
  content: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get markdown response schema - matches GetMarkdownResponse from codeboltjs
export const GetMarkdownResponseSchema = z.object({
  type: z.literal('getMarkdownResponse'),
  markdown: z.string().optional(),
  content: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get content response schema - matches GetContentResponse from codeboltjs
export const GetContentResponseSchema = z.object({
  type: z.literal('getContentResponse'),
  content: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get snapshot response schema - matches BrowserSnapshotResponse from codeboltjs
export const GetSnapShotResponseSchema = z.object({
  type: z.literal('getSnapShotResponse'),
  payload: z.object({
    tree: z.any().optional(),
    action: z.string().optional(),
    success: z.boolean().optional(),
    content: z.string().optional(),
    html: z.string().optional(),
    markdown: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    viewport: z.any().optional(),
    info: z.any().optional(),
    screenshot: z.string().optional(),
    pdf: z.any().optional(),
    elements: z.array(z.object({
      id: z.string(),
      tag: z.string(),
      text: z.string(),
      attributes: z.record(z.string())
    })).optional(),
    selector: z.string().optional(),
    fullPage: z.boolean().optional(),
    options: z.record(z.any()).optional()
  }).optional(),
  eventId: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Get browser info response schema - matches BrowserInfoResponse from codeboltjs
export const GetBrowserInfoResponseSchema = z.object({
  type: z.literal('getBrowserInfoResponse'),
  payload: z.object({
    info: z.any().optional(),
    action: z.string().optional(),
    success: z.boolean().optional(),
    content: z.string().optional(),
    html: z.string().optional(),
    markdown: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
    viewport: z.any().optional(),
    tree: z.any().optional(),
    screenshot: z.string().optional(),
    pdf: z.any().optional(),
    elements: z.array(z.object({
      id: z.string(),
      tag: z.string(),
      text: z.string(),
      attributes: z.record(z.string())
    })).optional(),
    selector: z.string().optional(),
    fullPage: z.boolean().optional(),
    options: z.record(z.any()).optional()
  }).optional(),
  eventId: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Extract text response schema - matches ExtractTextResponse from codeboltjs
export const ExtractTextResponseSchema = z.object({
  type: z.literal('extractTextResponse'),
  text: z.string().optional(),
  content: z.string().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Browser error response schema
// Sent when browser socket connection is not available
export const BrowserErrorResponseSchema = z.object({
  type: z.literal('error'),
  message: z.literal('Browser socket not found'),
  success: z.boolean().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Union of all browser service response schemas
export const BrowserServiceResponseSchema = z.union([
  NewPageResponseSchema,
  ScrollResponseSchema,
  TypeResponseSchema,
  ClickResponseSchema,
  EnterResponseSchema,
  SearchResponseSchema,
  GetUrlResponseSchema,
  GoToPageResponseSchema,
  ScreenshotResponseSchema,
  HtmlReceivedSchema,
  GetMarkdownResponseSchema,
  GetContentResponseSchema,
  GetSnapShotResponseSchema,
  GetBrowserInfoResponseSchema,
  ExtractTextResponseSchema,
  BrowserErrorResponseSchema
]);

// Export with the expected name for the index file
export const browserServiceResponseSchema = BrowserServiceResponseSchema;

// Type exports
export type BrowserActionResponseData = z.infer<typeof BrowserActionResponseDataSchema>;
export type NewPageResponse = z.infer<typeof NewPageResponseSchema>;
export type ScrollResponse = z.infer<typeof ScrollResponseSchema>;
export type TypeResponse = z.infer<typeof TypeResponseSchema>;
export type ClickResponse = z.infer<typeof ClickResponseSchema>;
export type EnterResponse = z.infer<typeof EnterResponseSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type GetUrlResponse = z.infer<typeof GetUrlResponseSchema>;
export type GoToPageResponse = z.infer<typeof GoToPageResponseSchema>;
export type ScreenshotResponse = z.infer<typeof ScreenshotResponseSchema>;
export type HtmlReceived = z.infer<typeof HtmlReceivedSchema>;
export type GetMarkdownResponse = z.infer<typeof GetMarkdownResponseSchema>;
export type GetContentResponse = z.infer<typeof GetContentResponseSchema>;
export type GetSnapShotResponse = z.infer<typeof GetSnapShotResponseSchema>;
export type GetBrowserInfoResponse = z.infer<typeof GetBrowserInfoResponseSchema>;
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>;
export type BrowserErrorResponse = z.infer<typeof BrowserErrorResponseSchema>;
export type BrowserServiceResponse = z.infer<typeof BrowserServiceResponseSchema>;
