import { z } from 'zod';

/**
 * Browser Event Schemas for Agent-to-App Communication
 * Based on codeboltjs/src/modules/browser.ts module operations
 */

// Base browser message schema
export const browserEventBaseSchema = z.object({
  type: z.literal('browserEvent'),
  action: z.string(),
  requestId: z.string()
});

// New Page Event Schema
export const newPageEventSchema = browserEventBaseSchema.extend({
  action: z.literal('newPage'),
});

// Get URL Event Schema
export const getUrlEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getUrl'),
});

// Go To Page Event Schema
export const goToPageEventSchema = browserEventBaseSchema.extend({
  action: z.literal('goToPage'),
  url: z.string(),
});

// Screenshot Event Schema
export const screenshotEventSchema = browserEventBaseSchema.extend({
  action: z.literal('screenshot'),
});

// Get HTML Event Schema
export const getHtmlEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getHTML'),
});

// Get Markdown Event Schema
export const getMarkdownEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getMarkdown'),
});

// Get PDF Event Schema
export const getPdfEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getPDF'),
});

// PDF to Text Event Schema
export const pdfToTextEventSchema = browserEventBaseSchema.extend({
  action: z.literal('pdfToText'),
});

// Get Content Event Schema
export const getContentEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getContent'),
});

// Get Snapshot Event Schema
export const getSnapShotEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getSnapShot'),
});

// Get Browser Info Event Schema
export const getBrowserInfoEventSchema = browserEventBaseSchema.extend({
  action: z.literal('getBrowserInfo'),
});

// Extract Text Event Schema
export const extractTextEventSchema = browserEventBaseSchema.extend({
  action: z.literal('extractText'),
});

// Close Event Schema
export const closeEventSchema = browserEventBaseSchema.extend({
  action: z.literal('close'),
});

// Scroll Event Schema
export const scrollEventSchema = browserEventBaseSchema.extend({
  action: z.literal('scroll'),
  direction: z.string(),
  pixels: z.string(),
});

// Type Event Schema
export const typeEventSchema = browserEventBaseSchema.extend({
  action: z.literal('type'),
  text: z.string(),
  elementid: z.string(),
});

// Click Event Schema
export const clickEventSchema = browserEventBaseSchema.extend({
  action: z.literal('click'),
  elementid: z.string(),
});

// Enter Event Schema
export const enterEventSchema = browserEventBaseSchema.extend({
  action: z.literal('enter'),
});

// Search Event Schema
export const searchEventSchema = browserEventBaseSchema.extend({
  action: z.literal('search'),
  elementid: z.string(),
  query: z.string(),
});

// Union of all browser event schemas
export const browserEventSchema = z.union([
  newPageEventSchema,
  getUrlEventSchema,
  goToPageEventSchema,
  screenshotEventSchema,
  getHtmlEventSchema,
  getMarkdownEventSchema,
  getPdfEventSchema,
  pdfToTextEventSchema,
  getContentEventSchema,
  getSnapShotEventSchema,
  getBrowserInfoEventSchema,
  extractTextEventSchema,
  closeEventSchema,
  scrollEventSchema,
  typeEventSchema,
  clickEventSchema,
  enterEventSchema,
  searchEventSchema,
]);

// Inferred TypeScript types for events
export type BrowserEventBase = z.infer<typeof browserEventBaseSchema>;
export type NewPageEvent = z.infer<typeof newPageEventSchema>;
export type GetUrlEvent = z.infer<typeof getUrlEventSchema>;
export type GoToPageEvent = z.infer<typeof goToPageEventSchema>;
export type ScreenshotEvent = z.infer<typeof screenshotEventSchema>;
export type GetHtmlEvent = z.infer<typeof getHtmlEventSchema>;
export type GetMarkdownEvent = z.infer<typeof getMarkdownEventSchema>;
export type GetPdfEvent = z.infer<typeof getPdfEventSchema>;
export type PdfToTextEvent = z.infer<typeof pdfToTextEventSchema>;
export type GetContentEvent = z.infer<typeof getContentEventSchema>;
export type GetSnapShotEvent = z.infer<typeof getSnapShotEventSchema>;
export type GetBrowserInfoEvent = z.infer<typeof getBrowserInfoEventSchema>;
export type ExtractTextEvent = z.infer<typeof extractTextEventSchema>;
export type CloseEvent = z.infer<typeof closeEventSchema>;
export type ScrollEvent = z.infer<typeof scrollEventSchema>;
export type TypeEvent = z.infer<typeof typeEventSchema>;
export type ClickEvent = z.infer<typeof clickEventSchema>;
export type EnterEvent = z.infer<typeof enterEventSchema>;
export type SearchEvent = z.infer<typeof searchEventSchema>;
export type BrowserEvent = z.infer<typeof browserEventSchema>;
