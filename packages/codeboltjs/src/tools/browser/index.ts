/**
 * Browser tools - Individual tools for each browser action
 */

// Individual browser tools
export { BrowserNavigateTool, type BrowserNavigateParams } from './navigate';
export { BrowserScreenshotTool, type BrowserScreenshotParams } from './screenshot';
export { BrowserClickTool, type BrowserClickParams } from './click';
export { BrowserTypeTool, type BrowserTypeParams } from './type';
export { BrowserScrollTool, type BrowserScrollParams } from './scroll';
export { BrowserGetContentTool, type BrowserGetContentParams } from './get-content';
export { BrowserGetHtmlTool, type BrowserGetHtmlParams } from './get-html';
export { BrowserGetMarkdownTool, type BrowserGetMarkdownParams } from './get-markdown';
export { BrowserGetUrlTool, type BrowserGetUrlParams } from './get-url';
export { BrowserCloseTool, type BrowserCloseParams } from './close';
export { BrowserEnterTool, type BrowserEnterParams } from './enter';
export { BrowserSearchTool, type BrowserSearchParams } from './search';

// Create instances for convenience
import { BrowserNavigateTool } from './navigate';
import { BrowserScreenshotTool } from './screenshot';
import { BrowserClickTool } from './click';
import { BrowserTypeTool } from './type';
import { BrowserScrollTool } from './scroll';
import { BrowserGetContentTool } from './get-content';
import { BrowserGetHtmlTool } from './get-html';
import { BrowserGetMarkdownTool } from './get-markdown';
import { BrowserGetUrlTool } from './get-url';
import { BrowserCloseTool } from './close';
import { BrowserEnterTool } from './enter';
import { BrowserSearchTool } from './search';

/**
 * All browser tools
 */
export const browserTools = [
    new BrowserNavigateTool(),
    new BrowserScreenshotTool(),
    new BrowserClickTool(),
    new BrowserTypeTool(),
    new BrowserScrollTool(),
    new BrowserGetContentTool(),
    new BrowserGetHtmlTool(),
    new BrowserGetMarkdownTool(),
    new BrowserGetUrlTool(),
    new BrowserCloseTool(),
    new BrowserEnterTool(),
    new BrowserSearchTool(),
];
