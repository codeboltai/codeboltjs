/**
 * Episodic Memory Tools
 * 
 * Tools for managing episodic memories and events.
 */

export { EpisodicCreateMemoryTool } from './episodic-create-memory';
export { EpisodicListMemoriesTool } from './episodic-list-memories';
export { EpisodicGetMemoryTool } from './episodic-get-memory';
export { EpisodicAppendEventTool } from './episodic-append-event';
export { EpisodicQueryEventsTool } from './episodic-query-events';
export { EpisodicGetEventTypesTool } from './episodic-get-event-types';
export { EpisodicGetTagsTool } from './episodic-get-tags';
export { EpisodicGetAgentsTool } from './episodic-get-agents';
export { EpisodicArchiveMemoryTool } from './episodic-archive-memory';
export { EpisodicUnarchiveMemoryTool } from './episodic-unarchive-memory';
export { EpisodicUpdateTitleTool } from './episodic-update-title';

import { EpisodicCreateMemoryTool } from './episodic-create-memory';
import { EpisodicListMemoriesTool } from './episodic-list-memories';
import { EpisodicGetMemoryTool } from './episodic-get-memory';
import { EpisodicAppendEventTool } from './episodic-append-event';
import { EpisodicQueryEventsTool } from './episodic-query-events';
import { EpisodicGetEventTypesTool } from './episodic-get-event-types';
import { EpisodicGetTagsTool } from './episodic-get-tags';
import { EpisodicGetAgentsTool } from './episodic-get-agents';
import { EpisodicArchiveMemoryTool } from './episodic-archive-memory';
import { EpisodicUnarchiveMemoryTool } from './episodic-unarchive-memory';
import { EpisodicUpdateTitleTool } from './episodic-update-title';

/**
 * Array of all episodic memory tools
 */
export const episodicMemoryTools = [
    new EpisodicCreateMemoryTool(),
    new EpisodicListMemoriesTool(),
    new EpisodicGetMemoryTool(),
    new EpisodicAppendEventTool(),
    new EpisodicQueryEventsTool(),
    new EpisodicGetEventTypesTool(),
    new EpisodicGetTagsTool(),
    new EpisodicGetAgentsTool(),
    new EpisodicArchiveMemoryTool(),
    new EpisodicUnarchiveMemoryTool(),
    new EpisodicUpdateTitleTool(),
];
