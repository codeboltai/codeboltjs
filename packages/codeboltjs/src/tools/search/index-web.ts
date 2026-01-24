import { WebSearchTool } from './web-search';
import { GetFirstLinkTool } from './get-first-link';

export const webSearchTools = [new WebSearchTool(), new GetFirstLinkTool()];
export * from './web-search';
export * from './get-first-link';
