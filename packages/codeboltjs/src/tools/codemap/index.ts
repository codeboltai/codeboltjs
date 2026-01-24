/**
 * Codemap Tools
 * 
 * Tools for managing codemaps (visual representations of code structure).
 */

export { CodemapListTool } from './codemap-list';
export { CodemapGetTool } from './codemap-get';
export { CodemapCreateTool } from './codemap-create';
export { CodemapSaveTool } from './codemap-save';
export { CodemapSetStatusTool } from './codemap-set-status';
export { CodemapUpdateTool } from './codemap-update';
export { CodemapDeleteTool } from './codemap-delete';

import { CodemapListTool } from './codemap-list';
import { CodemapGetTool } from './codemap-get';
import { CodemapCreateTool } from './codemap-create';
import { CodemapSaveTool } from './codemap-save';
import { CodemapSetStatusTool } from './codemap-set-status';
import { CodemapUpdateTool } from './codemap-update';
import { CodemapDeleteTool } from './codemap-delete';

/**
 * Array of all codemap tools
 */
export const codemapTools = [
    new CodemapListTool(),
    new CodemapGetTool(),
    new CodemapCreateTool(),
    new CodemapSaveTool(),
    new CodemapSetStatusTool(),
    new CodemapUpdateTool(),
    new CodemapDeleteTool(),
];
