import { DBMemoryAddKnowledgeTool } from './dbmemory-add';
import { DBMemoryGetKnowledgeTool } from './dbmemory-get';

export const dbmemoryTools = [new DBMemoryAddKnowledgeTool(), new DBMemoryGetKnowledgeTool()];
export * from './dbmemory-add';
export * from './dbmemory-get';
