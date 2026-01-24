/**
 * Project Structure tools
 * Tools for managing project structure metadata, packages, routes, dependencies, and more.
 */

// Metadata tools
export { GetMetadataTool, type GetMetadataToolParams } from './ps-get-metadata';
export { UpdateMetadataTool, type UpdateMetadataToolParams } from './ps-update-metadata';

// Package tools
export { GetPackagesTool, type GetPackagesToolParams } from './ps-get-packages';
export { GetPackageTool, type GetPackageToolParams } from './ps-get-package';
export { CreatePackageTool, type CreatePackageToolParams } from './ps-create-package';
export { UpdatePackageTool, type UpdatePackageToolParams } from './ps-update-package';
export { DeletePackageTool, type DeletePackageToolParams } from './ps-delete-package';

// API Route tools
export { AddRouteTool, type AddRouteToolParams } from './ps-add-route';
export { UpdateRouteTool, type UpdateRouteToolParams } from './ps-update-route';
export { DeleteRouteTool, type DeleteRouteToolParams } from './ps-delete-route';

// Database Table tools
export { AddTableTool, type AddTableToolParams } from './ps-add-table';
export { UpdateTableTool, type UpdateTableToolParams } from './ps-update-table';
export { DeleteTableTool, type DeleteTableToolParams } from './ps-delete-table';

// Dependency tools
export { AddDependencyTool, type AddDependencyToolParams } from './ps-add-dependency';
export { UpdateDependencyTool, type UpdateDependencyToolParams } from './ps-update-dependency';
export { DeleteDependencyTool, type DeleteDependencyToolParams } from './ps-delete-dependency';

// Command tools
export { AddCommandTool, type AddCommandToolParams } from './ps-add-command';
export { UpdateCommandTool, type UpdateCommandToolParams } from './ps-update-command';
export { DeleteCommandTool, type DeleteCommandToolParams } from './ps-delete-command';

// UI Route tools
export { AddUiRouteTool, type AddUiRouteToolParams } from './ps-add-ui-route';
export { UpdateUiRouteTool, type UpdateUiRouteToolParams } from './ps-update-ui-route';
export { DeleteUiRouteTool, type DeleteUiRouteToolParams } from './ps-delete-ui-route';

// Deployment tools
export { AddDeploymentTool, type AddDeploymentToolParams } from './ps-add-deployment';
export { UpdateDeploymentTool, type UpdateDeploymentToolParams } from './ps-update-deployment';
export { DeleteDeploymentTool, type DeleteDeploymentToolParams } from './ps-delete-deployment';

// Configuration tools
export { UpdateGitTool, type UpdateGitToolParams } from './ps-update-git';
export { UpdateDesignGuidelinesTool, type UpdateDesignGuidelinesToolParams } from './ps-update-design-guidelines';
export { UpdateFrontendFrameworkTool, type UpdateFrontendFrameworkToolParams } from './ps-update-frontend-framework';
export { UpdateSectionTool, type UpdateSectionToolParams } from './ps-update-section';

// Create instances for convenience
import { GetMetadataTool } from './ps-get-metadata';
import { UpdateMetadataTool } from './ps-update-metadata';
import { GetPackagesTool } from './ps-get-packages';
import { GetPackageTool } from './ps-get-package';
import { CreatePackageTool } from './ps-create-package';
import { UpdatePackageTool } from './ps-update-package';
import { DeletePackageTool } from './ps-delete-package';
import { AddRouteTool } from './ps-add-route';
import { UpdateRouteTool } from './ps-update-route';
import { DeleteRouteTool } from './ps-delete-route';
import { AddTableTool } from './ps-add-table';
import { UpdateTableTool } from './ps-update-table';
import { DeleteTableTool } from './ps-delete-table';
import { AddDependencyTool } from './ps-add-dependency';
import { UpdateDependencyTool } from './ps-update-dependency';
import { DeleteDependencyTool } from './ps-delete-dependency';
import { AddCommandTool } from './ps-add-command';
import { UpdateCommandTool } from './ps-update-command';
import { DeleteCommandTool } from './ps-delete-command';
import { AddUiRouteTool } from './ps-add-ui-route';
import { UpdateUiRouteTool } from './ps-update-ui-route';
import { DeleteUiRouteTool } from './ps-delete-ui-route';
import { AddDeploymentTool } from './ps-add-deployment';
import { UpdateDeploymentTool } from './ps-update-deployment';
import { DeleteDeploymentTool } from './ps-delete-deployment';
import { UpdateGitTool } from './ps-update-git';
import { UpdateDesignGuidelinesTool } from './ps-update-design-guidelines';
import { UpdateFrontendFrameworkTool } from './ps-update-frontend-framework';
import { UpdateSectionTool } from './ps-update-section';

/**
 * All project structure tools
 */
export const projectStructureTools = [
    // Metadata
    new GetMetadataTool(),
    new UpdateMetadataTool(),
    // Packages
    new GetPackagesTool(),
    new GetPackageTool(),
    new CreatePackageTool(),
    new UpdatePackageTool(),
    new DeletePackageTool(),
    // API Routes
    new AddRouteTool(),
    new UpdateRouteTool(),
    new DeleteRouteTool(),
    // Database Tables
    new AddTableTool(),
    new UpdateTableTool(),
    new DeleteTableTool(),
    // Dependencies
    new AddDependencyTool(),
    new UpdateDependencyTool(),
    new DeleteDependencyTool(),
    // Commands
    new AddCommandTool(),
    new UpdateCommandTool(),
    new DeleteCommandTool(),
    // UI Routes
    new AddUiRouteTool(),
    new UpdateUiRouteTool(),
    new DeleteUiRouteTool(),
    // Deployments
    new AddDeploymentTool(),
    new UpdateDeploymentTool(),
    new DeleteDeploymentTool(),
    // Configuration
    new UpdateGitTool(),
    new UpdateDesignGuidelinesTool(),
    new UpdateFrontendFrameworkTool(),
    new UpdateSectionTool(),
];
