// Browser API types

export enum BrowserActionEnum {
  NAVIGATE = 'launch',
  CLICK = 'click',
  TYPE = 'type',
  SCROLL_DOWN = 'scroll_down',
  SCROLL_UP = 'scroll_up',
  CLOSE = 'close',
  GET_HTML = 'getHtml',
  GET_CONTENT = 'getContent',
  GET_MARKDOWN = 'getMarkdown',
  SCREENSHOT = 'screenshot',
  EXTRACT_TEXT = 'extractText',
  BROWSER_ENTER = 'browserEnter',
  GET_PDF = 'getPdf',
}

export interface BrowserSendActionRequest {
  action: string;
  url?: string;
  selector?: string;
  text?: string;
  fullPage?: boolean;
  timeout?: number;
  key?: string;
}

export interface BrowserNavigateRequest {
  url: string;
}

export interface BrowserClickRequest {
  selector: string;
}

export interface BrowserFillRequest {
  selector: string;
  text: string;
}

export interface BrowserScreenshotRequest {
  fullPage?: boolean;
}

export interface BrowserActionResult {
  success: boolean;
  action: string;
  data?: {
    html?: string;
    text?: string;
    markdown?: string;
    screenshot?: string;
    pdf?: string;
    url?: string;
    title?: string;
  };
  error?: string;
}

export interface BrowserInstance {
  id: string;
  url?: string;
  title?: string;
  isActive: boolean;
  createdAt?: string;
}
