/**
 * Project tools
 */

export { ProjectGetSettingsTool, type ProjectGetSettingsToolParams } from './project-get-settings';
export { ProjectGetPathTool, type ProjectGetPathToolParams } from './project-get-path';
export { ProjectGetRepoMapTool, type ProjectGetRepoMapToolParams } from './project-get-repo-map';
export { ProjectRunTool, type ProjectRunToolParams } from './project-run';
export { ProjectGetEditorStatusTool, type ProjectGetEditorStatusToolParams } from './project-get-editor-status';

// Create instances for convenience
import { ProjectGetSettingsTool } from './project-get-settings';
import { ProjectGetPathTool } from './project-get-path';
import { ProjectGetRepoMapTool } from './project-get-repo-map';
import { ProjectRunTool } from './project-run';
import { ProjectGetEditorStatusTool } from './project-get-editor-status';

/**
 * All project tools
 */
export const projectTools = [
    new ProjectGetSettingsTool(),
    new ProjectGetPathTool(),
    new ProjectGetRepoMapTool(),
    new ProjectRunTool(),
    new ProjectGetEditorStatusTool(),
];
