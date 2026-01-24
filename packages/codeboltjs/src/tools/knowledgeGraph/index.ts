/**
 * Knowledge Graph Tools
 * 
 * Tools for managing knowledge graph operations including templates, instances, 
 * memory records, edges, view templates, and views.
 */

// Instance Template Operations
export { KGCreateInstanceTemplateTool } from './kg-create-instance-template';
export { KGGetInstanceTemplateTool } from './kg-get-instance-template';
export { KGListInstanceTemplatesTool } from './kg-list-instance-templates';
export { KGUpdateInstanceTemplateTool } from './kg-update-instance-template';
export { KGDeleteInstanceTemplateTool } from './kg-delete-instance-template';

// Instance Operations
export { KGCreateInstanceTool } from './kg-create-instance';
export { KGGetInstanceTool } from './kg-get-instance';
export { KGListInstancesTool } from './kg-list-instances';
export { KGDeleteInstanceTool } from './kg-delete-instance';

// Memory Record Operations
export { KGAddMemoryRecordTool } from './kg-add-memory-record';
export { KGAddMemoryRecordsTool } from './kg-add-memory-records';
export { KGGetMemoryRecordTool } from './kg-get-memory-record';
export { KGListMemoryRecordsTool } from './kg-list-memory-records';
export { KGUpdateMemoryRecordTool } from './kg-update-memory-record';
export { KGDeleteMemoryRecordTool } from './kg-delete-memory-record';

// Edge Operations
export { KGAddEdgeTool } from './kg-add-edge';
export { KGAddEdgesTool } from './kg-add-edges';
export { KGListEdgesTool } from './kg-list-edges';
export { KGDeleteEdgeTool } from './kg-delete-edge';

// View Template Operations
export { KGCreateViewTemplateTool } from './kg-create-view-template';
export { KGGetViewTemplateTool } from './kg-get-view-template';
export { KGListViewTemplatesTool } from './kg-list-view-templates';
export { KGUpdateViewTemplateTool } from './kg-update-view-template';
export { KGDeleteViewTemplateTool } from './kg-delete-view-template';

// View Operations
export { KGCreateViewTool } from './kg-create-view';
export { KGListViewsTool } from './kg-list-views';
export { KGExecuteViewTool } from './kg-execute-view';
export { KGDeleteViewTool } from './kg-delete-view';

// Import all tools
import { KGCreateInstanceTemplateTool } from './kg-create-instance-template';
import { KGGetInstanceTemplateTool } from './kg-get-instance-template';
import { KGListInstanceTemplatesTool } from './kg-list-instance-templates';
import { KGUpdateInstanceTemplateTool } from './kg-update-instance-template';
import { KGDeleteInstanceTemplateTool } from './kg-delete-instance-template';
import { KGCreateInstanceTool } from './kg-create-instance';
import { KGGetInstanceTool } from './kg-get-instance';
import { KGListInstancesTool } from './kg-list-instances';
import { KGDeleteInstanceTool } from './kg-delete-instance';
import { KGAddMemoryRecordTool } from './kg-add-memory-record';
import { KGAddMemoryRecordsTool } from './kg-add-memory-records';
import { KGGetMemoryRecordTool } from './kg-get-memory-record';
import { KGListMemoryRecordsTool } from './kg-list-memory-records';
import { KGUpdateMemoryRecordTool } from './kg-update-memory-record';
import { KGDeleteMemoryRecordTool } from './kg-delete-memory-record';
import { KGAddEdgeTool } from './kg-add-edge';
import { KGAddEdgesTool } from './kg-add-edges';
import { KGListEdgesTool } from './kg-list-edges';
import { KGDeleteEdgeTool } from './kg-delete-edge';
import { KGCreateViewTemplateTool } from './kg-create-view-template';
import { KGGetViewTemplateTool } from './kg-get-view-template';
import { KGListViewTemplatesTool } from './kg-list-view-templates';
import { KGUpdateViewTemplateTool } from './kg-update-view-template';
import { KGDeleteViewTemplateTool } from './kg-delete-view-template';
import { KGCreateViewTool } from './kg-create-view';
import { KGListViewsTool } from './kg-list-views';
import { KGExecuteViewTool } from './kg-execute-view';
import { KGDeleteViewTool } from './kg-delete-view';

/**
 * Array of all knowledge graph tools
 */
export const knowledgeGraphTools = [
    // Instance Template Operations
    new KGCreateInstanceTemplateTool(),
    new KGGetInstanceTemplateTool(),
    new KGListInstanceTemplatesTool(),
    new KGUpdateInstanceTemplateTool(),
    new KGDeleteInstanceTemplateTool(),
    // Instance Operations
    new KGCreateInstanceTool(),
    new KGGetInstanceTool(),
    new KGListInstancesTool(),
    new KGDeleteInstanceTool(),
    // Memory Record Operations
    new KGAddMemoryRecordTool(),
    new KGAddMemoryRecordsTool(),
    new KGGetMemoryRecordTool(),
    new KGListMemoryRecordsTool(),
    new KGUpdateMemoryRecordTool(),
    new KGDeleteMemoryRecordTool(),
    // Edge Operations
    new KGAddEdgeTool(),
    new KGAddEdgesTool(),
    new KGListEdgesTool(),
    new KGDeleteEdgeTool(),
    // View Template Operations
    new KGCreateViewTemplateTool(),
    new KGGetViewTemplateTool(),
    new KGListViewTemplatesTool(),
    new KGUpdateViewTemplateTool(),
    new KGDeleteViewTemplateTool(),
    // View Operations
    new KGCreateViewTool(),
    new KGListViewsTool(),
    new KGExecuteViewTool(),
    new KGDeleteViewTool(),
];
