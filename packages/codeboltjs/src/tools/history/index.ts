/**
 * History operation tools
 */

export { HistorySummarizeAllTool, type HistorySummarizeAllToolParams } from './history-summarize-all';
export { HistorySummarizeTool, type HistorySummarizeToolParams, type SummarizeMessage } from './history-summarize';

// Create instances for convenience
import { HistorySummarizeAllTool } from './history-summarize-all';
import { HistorySummarizeTool } from './history-summarize';

/**
 * All history operation tools
 */
export const historyTools = [
    new HistorySummarizeAllTool(),
    new HistorySummarizeTool(),
];
