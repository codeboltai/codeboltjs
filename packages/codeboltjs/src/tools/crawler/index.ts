/**
 * Crawler tools - Individual tools for each crawler action
 */

// Individual crawler tools
export { CrawlerStartTool, type CrawlerStartParams } from './crawler-start';
export { CrawlerScreenshotTool, type CrawlerScreenshotParams } from './crawler-screenshot';
export { CrawlerGoToPageTool, type CrawlerGoToPageParams } from './crawler-go-to-page';
export { CrawlerScrollTool, type CrawlerScrollParams } from './crawler-scroll';
export { CrawlerClickTool, type CrawlerClickParams } from './crawler-click';

// Create instances for convenience
import { CrawlerStartTool } from './crawler-start';
import { CrawlerScreenshotTool } from './crawler-screenshot';
import { CrawlerGoToPageTool } from './crawler-go-to-page';
import { CrawlerScrollTool } from './crawler-scroll';
import { CrawlerClickTool } from './crawler-click';

/**
 * All crawler tools
 */
export const crawlerTools = [
    new CrawlerStartTool(),
    new CrawlerScreenshotTool(),
    new CrawlerGoToPageTool(),
    new CrawlerScrollTool(),
    new CrawlerClickTool(),
];
