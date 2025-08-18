/**
 * Browser SDK Function Types
 * Types for the cbbrowser module functions
 */

// Base response interface for browser operations
export interface BaseBrowserSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Browser viewport information
export interface BrowserViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  pageYOffset: number;
  pageXOffset: number;
  windowWidth: number;
  windowHeight: number;
  offsetHeight: number;
  scrollHeight: number;
}

// Browser snapshot structure
export interface BrowserSnapshot {
  tree: {
    strings: string[];
    documents: Array<{
      nodes: {
        backendNodeId: number[];
        attributes: Array<{ name: string; value: string }>;
        nodeValue: string[];
        parentIndex: number[];
        nodeType: number[];
        nodeName: string[];
        isClickable: { index: number[] };
        textValue: { index: number[]; value: string[] };
        inputValue: { index: number[]; value: string[] };
        inputChecked: { index: number[] };
      };
    }>;
  };
}

// Navigation responses
export interface GoToPageResponse extends BaseBrowserSDKResponse {
  url?: string;
}

export interface UrlResponse extends BaseBrowserSDKResponse {
  url?: string;
  currentUrl?: string;
}

// Content responses
export interface GetMarkdownResponse extends BaseBrowserSDKResponse {
  markdown?: string;
  content?: string;
}

export interface HtmlReceived extends BaseBrowserSDKResponse {
  html?: string;
  content?: string;
}

export interface ExtractTextResponse extends BaseBrowserSDKResponse {
  text?: string;
  content?: string;
}

export interface GetContentResponse extends BaseBrowserSDKResponse {
  content?: string;
  html?: string;
  text?: string;
}

// Screenshot and info responses
export interface BrowserScreenshotResponse extends BaseBrowserSDKResponse {
  screenshot?: string;
  fullPage?: boolean;
}

export interface BrowserInfoResponse extends BaseBrowserSDKResponse {
  info?: BrowserViewportInfo;
  viewport?: BrowserViewportInfo;
}

export interface BrowserSnapshotResponse extends BaseBrowserSDKResponse {
  tree?: BrowserSnapshot['tree'];
}

// Generic browser action response
export interface BrowserActionResponseData extends BaseBrowserSDKResponse {
  action?: string;
  content?: string;
  html?: string;
  markdown?: string;
  text?: string;
  url?: string;
  viewport?: BrowserViewportInfo;
  info?: BrowserViewportInfo;
  tree?: BrowserSnapshot['tree'];
  screenshot?: string;
  pdf?: Uint8Array | string;
  elements?: Array<{
    id: string;
    tag: string;
    text: string;
    attributes: Record<string, string>;
  }>;
  selector?: string;
  fullPage?: boolean;
  options?: Record<string, any>;
}
