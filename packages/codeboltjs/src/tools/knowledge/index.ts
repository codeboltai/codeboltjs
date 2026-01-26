/**
 * Knowledge Graph tools
 */

// Template tools
export { KGTemplateCreateTool, type KGTemplateCreateToolParams } from './kg-template-create';
export { KGTemplateListTool, type KGTemplateListToolParams } from './kg-template-list';
export { KGTemplateGetTool, type KGTemplateGetToolParams } from './kg-template-get';
export { KGTemplateDeleteTool, type KGTemplateDeleteToolParams } from './kg-template-delete';

// Instance tools
export { KGInstanceCreateTool, type KGInstanceCreateToolParams } from './kg-instance-create';
export { KGInstanceListTool, type KGInstanceListToolParams } from './kg-instance-list';
export { KGInstanceGetTool, type KGInstanceGetToolParams } from './kg-instance-get';
export { KGInstanceDeleteTool, type KGInstanceDeleteToolParams } from './kg-instance-delete';

// Record tools
export { KGRecordAddTool, type KGRecordAddToolParams } from './kg-record-add';
export { KGRecordListTool, type KGRecordListToolParams } from './kg-record-list';

// Edge tools
export { KGEdgeAddTool, type KGEdgeAddToolParams } from './kg-edge-add';
export { KGEdgeListTool, type KGEdgeListToolParams } from './kg-edge-list';

// Create instances for convenience
import { KGTemplateCreateTool } from './kg-template-create';
import { KGTemplateListTool } from './kg-template-list';
import { KGTemplateGetTool } from './kg-template-get';
import { KGTemplateDeleteTool } from './kg-template-delete';
import { KGInstanceCreateTool } from './kg-instance-create';
import { KGInstanceListTool } from './kg-instance-list';
import { KGInstanceGetTool } from './kg-instance-get';
import { KGInstanceDeleteTool } from './kg-instance-delete';
import { KGRecordAddTool } from './kg-record-add';
import { KGRecordListTool } from './kg-record-list';
import { KGEdgeAddTool } from './kg-edge-add';
import { KGEdgeListTool } from './kg-edge-list';

/**
 * All knowledge graph tools
 */
export const knowledgeTools = [
    // Template tools
    new KGTemplateCreateTool(),
    new KGTemplateListTool(),
    new KGTemplateGetTool(),
    new KGTemplateDeleteTool(),
    // Instance tools
    new KGInstanceCreateTool(),
    new KGInstanceListTool(),
    new KGInstanceGetTool(),
    new KGInstanceDeleteTool(),
    // Record tools
    new KGRecordAddTool(),
    new KGRecordListTool(),
    // Edge tools
    new KGEdgeAddTool(),
    new KGEdgeListTool(),
];
