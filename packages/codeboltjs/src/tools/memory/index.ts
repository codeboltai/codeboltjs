/**
 * Memory operations tools
 */

// JSON Memory Tools
export { MemoryJsonSaveTool, type MemoryJsonSaveToolParams } from './memory-json-save';
export { MemoryJsonUpdateTool, type MemoryJsonUpdateToolParams } from './memory-json-update';
export { MemoryJsonDeleteTool, type MemoryJsonDeleteToolParams } from './memory-json-delete';
export { MemoryJsonListTool, type MemoryJsonListToolParams } from './memory-json-list';

// Todo Memory Tools
export { MemoryTodoSaveTool, type MemoryTodoSaveToolParams } from './memory-todo-save';
export { MemoryTodoUpdateTool, type MemoryTodoUpdateToolParams } from './memory-todo-update';
export { MemoryTodoDeleteTool, type MemoryTodoDeleteToolParams } from './memory-todo-delete';
export { MemoryTodoListTool, type MemoryTodoListToolParams } from './memory-todo-list';

// Markdown Memory Tools
export { MemoryMarkdownSaveTool, type MemoryMarkdownSaveToolParams } from './memory-markdown-save';
export { MemoryMarkdownUpdateTool, type MemoryMarkdownUpdateToolParams } from './memory-markdown-update';
export { MemoryMarkdownDeleteTool, type MemoryMarkdownDeleteToolParams } from './memory-markdown-delete';
export { MemoryMarkdownListTool, type MemoryMarkdownListToolParams } from './memory-markdown-list';

// Episodic Memory Tools
export { EpisodicMemoryCreateTool, type EpisodicMemoryCreateToolParams } from './episodic-memory-create';
export { EpisodicMemoryListTool, type EpisodicMemoryListToolParams } from './episodic-memory-list';
export { EpisodicMemoryGetTool, type EpisodicMemoryGetToolParams } from './episodic-memory-get';
export { EpisodicMemoryAppendEventTool, type EpisodicMemoryAppendEventToolParams } from './episodic-memory-append-event';
export { EpisodicMemoryQueryEventsTool, type EpisodicMemoryQueryEventsToolParams } from './episodic-memory-query-events';
export { EpisodicMemoryGetEventTypesTool, type EpisodicMemoryGetEventTypesToolParams } from './episodic-memory-get-event-types';
export { EpisodicMemoryArchiveTool, type EpisodicMemoryArchiveToolParams } from './episodic-memory-archive';
export { EpisodicMemoryUpdateTitleTool, type EpisodicMemoryUpdateTitleToolParams } from './episodic-memory-update-title';

// Persistent Memory Tools
export { PersistentMemoryCreateTool, type PersistentMemoryCreateToolParams } from './persistent-memory-create';
export { PersistentMemoryGetTool, type PersistentMemoryGetToolParams } from './persistent-memory-get';
export { PersistentMemoryListTool, type PersistentMemoryListToolParams } from './persistent-memory-list';
export { PersistentMemoryUpdateTool, type PersistentMemoryUpdateToolParams } from './persistent-memory-update';
export { PersistentMemoryRetrieveTool, type PersistentMemoryRetrieveToolParams } from './persistent-memory-retrieve';

// Create instances for convenience
import { MemoryJsonSaveTool } from './memory-json-save';
import { MemoryJsonUpdateTool } from './memory-json-update';
import { MemoryJsonDeleteTool } from './memory-json-delete';
import { MemoryJsonListTool } from './memory-json-list';
import { MemoryTodoSaveTool } from './memory-todo-save';
import { MemoryTodoUpdateTool } from './memory-todo-update';
import { MemoryTodoDeleteTool } from './memory-todo-delete';
import { MemoryTodoListTool } from './memory-todo-list';
import { MemoryMarkdownSaveTool } from './memory-markdown-save';
import { MemoryMarkdownUpdateTool } from './memory-markdown-update';
import { MemoryMarkdownDeleteTool } from './memory-markdown-delete';
import { MemoryMarkdownListTool } from './memory-markdown-list';
import { EpisodicMemoryCreateTool } from './episodic-memory-create';
import { EpisodicMemoryListTool } from './episodic-memory-list';
import { EpisodicMemoryGetTool } from './episodic-memory-get';
import { EpisodicMemoryAppendEventTool } from './episodic-memory-append-event';
import { EpisodicMemoryQueryEventsTool } from './episodic-memory-query-events';
import { EpisodicMemoryGetEventTypesTool } from './episodic-memory-get-event-types';
import { EpisodicMemoryArchiveTool } from './episodic-memory-archive';
import { EpisodicMemoryUpdateTitleTool } from './episodic-memory-update-title';
import { PersistentMemoryCreateTool } from './persistent-memory-create';
import { PersistentMemoryGetTool } from './persistent-memory-get';
import { PersistentMemoryListTool } from './persistent-memory-list';
import { PersistentMemoryUpdateTool } from './persistent-memory-update';
import { PersistentMemoryRetrieveTool } from './persistent-memory-retrieve';

/**
 * All memory operation tools
 */
export const memoryTools = [
    // JSON Memory Tools
    new MemoryJsonSaveTool(),
    new MemoryJsonUpdateTool(),
    new MemoryJsonDeleteTool(),
    new MemoryJsonListTool(),
    // Todo Memory Tools
    new MemoryTodoSaveTool(),
    new MemoryTodoUpdateTool(),
    new MemoryTodoDeleteTool(),
    new MemoryTodoListTool(),
    // Markdown Memory Tools
    new MemoryMarkdownSaveTool(),
    new MemoryMarkdownUpdateTool(),
    new MemoryMarkdownDeleteTool(),
    new MemoryMarkdownListTool(),
    // Episodic Memory Tools
    new EpisodicMemoryCreateTool(),
    new EpisodicMemoryListTool(),
    new EpisodicMemoryGetTool(),
    new EpisodicMemoryAppendEventTool(),
    new EpisodicMemoryQueryEventsTool(),
    new EpisodicMemoryGetEventTypesTool(),
    new EpisodicMemoryArchiveTool(),
    new EpisodicMemoryUpdateTitleTool(),
    // Persistent Memory Tools
    new PersistentMemoryCreateTool(),
    new PersistentMemoryGetTool(),
    new PersistentMemoryListTool(),
    new PersistentMemoryUpdateTool(),
    new PersistentMemoryRetrieveTool(),
];
