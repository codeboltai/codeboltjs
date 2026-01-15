import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    PackageMetadata,
    CreatePackageData,
    UpdatePackageData,
    ApiRoute,
    DatabaseTable,
    Dependency,
    RunCommand,
    UiRoute,
    DeploymentConfig,
    GitInfo,
    DesignGuidelines,
    FrameworkInfo,
    ProjectStructureMetadataResponse,
    ProjectStructurePackagesResponse,
    ProjectStructurePackageResponse,
    ProjectStructureDeleteResponse,
    ProjectStructureUpdateResponse
} from '../types/projectStructure';

/**
 * Project Structure Module for codeboltjs
 * Provides functionality for managing project metadata, packages, routes, dependencies, etc.
 * Mirrors the projectStructureService.cli.ts operations via WebSocket.
 */
const codeboltProjectStructure = {
    // ================================
    // Metadata Operations
    // ================================

    /**
     * Get complete project metadata
     */
    getMetadata: async (workspacePath?: string): Promise<ProjectStructureMetadataResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.getMetadata',
                requestId,
                message: { workspacePath }
            },
            'projectStructureGetMetadataResponse'
        );
    },

    /**
     * Update workspace metadata
     */
    updateMetadata: async (updates: Record<string, any>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateMetadata',
                requestId,
                message: { updates, workspacePath }
            },
            'projectStructureUpdateMetadataResponse'
        );
    },

    // ================================
    // Package Operations
    // ================================

    /**
     * Get all packages in the workspace
     */
    getPackages: async (workspacePath?: string): Promise<ProjectStructurePackagesResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.getPackages',
                requestId,
                message: { workspacePath }
            },
            'projectStructureGetPackagesResponse'
        );
    },

    /**
     * Get a specific package by ID
     */
    getPackage: async (packageId: string, workspacePath?: string): Promise<ProjectStructurePackageResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.getPackage',
                requestId,
                message: { packageId, workspacePath }
            },
            'projectStructureGetPackageResponse'
        );
    },

    /**
     * Create a new package
     */
    createPackage: async (data: CreatePackageData, workspacePath?: string): Promise<ProjectStructurePackageResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.createPackage',
                requestId,
                message: { ...data, workspacePath }
            },
            'projectStructureCreatePackageResponse'
        );
    },

    /**
     * Update a package
     */
    updatePackage: async (packageId: string, updates: UpdatePackageData, workspacePath?: string): Promise<ProjectStructurePackageResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updatePackage',
                requestId,
                message: { packageId, updates, workspacePath }
            },
            'projectStructureUpdatePackageResponse'
        );
    },

    /**
     * Delete a package
     */
    deletePackage: async (packageId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deletePackage',
                requestId,
                message: { packageId, workspacePath }
            },
            'projectStructureDeletePackageResponse'
        );
    },

    // ================================
    // API Route Operations
    // ================================

    /**
     * Add an API route to a package
     */
    addRoute: async (packageId: string, route: Omit<ApiRoute, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addRoute',
                requestId,
                message: { packageId, route, workspacePath }
            },
            'projectStructureAddRouteResponse'
        );
    },

    /**
     * Update an API route
     */
    updateRoute: async (packageId: string, routeId: string, updates: Partial<ApiRoute>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateRoute',
                requestId,
                message: { packageId, routeId, updates, workspacePath }
            },
            'projectStructureUpdateRouteResponse'
        );
    },

    /**
     * Delete an API route
     */
    deleteRoute: async (packageId: string, routeId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteRoute',
                requestId,
                message: { packageId, routeId, workspacePath }
            },
            'projectStructureDeleteRouteResponse'
        );
    },

    // ================================
    // Database Table Operations
    // ================================

    /**
     * Add a database table to a package
     */
    addTable: async (packageId: string, table: Omit<DatabaseTable, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addTable',
                requestId,
                message: { packageId, table, workspacePath }
            },
            'projectStructureAddTableResponse'
        );
    },

    /**
     * Update a database table
     */
    updateTable: async (packageId: string, tableId: string, updates: Partial<DatabaseTable>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateTable',
                requestId,
                message: { packageId, tableId, updates, workspacePath }
            },
            'projectStructureUpdateTableResponse'
        );
    },

    /**
     * Delete a database table
     */
    deleteTable: async (packageId: string, tableId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteTable',
                requestId,
                message: { packageId, tableId, workspacePath }
            },
            'projectStructureDeleteTableResponse'
        );
    },

    // ================================
    // Dependency Operations
    // ================================

    /**
     * Add a dependency to a package
     */
    addDependency: async (packageId: string, dependency: Omit<Dependency, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addDependency',
                requestId,
                message: { packageId, dependency, workspacePath }
            },
            'projectStructureAddDependencyResponse'
        );
    },

    /**
     * Update a dependency
     */
    updateDependency: async (packageId: string, dependencyId: string, updates: Partial<Dependency>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateDependency',
                requestId,
                message: { packageId, dependencyId, updates, workspacePath }
            },
            'projectStructureUpdateDependencyResponse'
        );
    },

    /**
     * Delete a dependency
     */
    deleteDependency: async (packageId: string, dependencyId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteDependency',
                requestId,
                message: { packageId, dependencyId, workspacePath }
            },
            'projectStructureDeleteDependencyResponse'
        );
    },

    // ================================
    // Run Command Operations
    // ================================

    /**
     * Add a run command to a package
     */
    addCommand: async (packageId: string, command: Omit<RunCommand, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addCommand',
                requestId,
                message: { packageId, command, workspacePath }
            },
            'projectStructureAddCommandResponse'
        );
    },

    /**
     * Update a run command
     */
    updateCommand: async (packageId: string, commandId: string, updates: Partial<RunCommand>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateCommand',
                requestId,
                message: { packageId, commandId, updates, workspacePath }
            },
            'projectStructureUpdateCommandResponse'
        );
    },

    /**
     * Delete a run command
     */
    deleteCommand: async (packageId: string, commandId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteCommand',
                requestId,
                message: { packageId, commandId, workspacePath }
            },
            'projectStructureDeleteCommandResponse'
        );
    },

    // ================================
    // UI Route Operations
    // ================================

    /**
     * Add a UI route to a package
     */
    addUiRoute: async (packageId: string, route: Omit<UiRoute, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addUiRoute',
                requestId,
                message: { packageId, route, workspacePath }
            },
            'projectStructureAddUiRouteResponse'
        );
    },

    /**
     * Update a UI route
     */
    updateUiRoute: async (packageId: string, routeId: string, updates: Partial<UiRoute>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateUiRoute',
                requestId,
                message: { packageId, routeId, updates, workspacePath }
            },
            'projectStructureUpdateUiRouteResponse'
        );
    },

    /**
     * Delete a UI route
     */
    deleteUiRoute: async (packageId: string, routeId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteUiRoute',
                requestId,
                message: { packageId, routeId, workspacePath }
            },
            'projectStructureDeleteUiRouteResponse'
        );
    },

    // ================================
    // Deployment Config Operations
    // ================================

    /**
     * Add a deployment config to a package
     */
    addDeployment: async (packageId: string, config: Omit<DeploymentConfig, 'id'>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.addDeployment',
                requestId,
                message: { packageId, config, workspacePath }
            },
            'projectStructureAddDeploymentResponse'
        );
    },

    /**
     * Update a deployment config
     */
    updateDeployment: async (packageId: string, configId: string, updates: Partial<DeploymentConfig>, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateDeployment',
                requestId,
                message: { packageId, configId, updates, workspacePath }
            },
            'projectStructureUpdateDeploymentResponse'
        );
    },

    /**
     * Delete a deployment config
     */
    deleteDeployment: async (packageId: string, configId: string, workspacePath?: string): Promise<ProjectStructureDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.deleteDeployment',
                requestId,
                message: { packageId, configId, workspacePath }
            },
            'projectStructureDeleteDeploymentResponse'
        );
    },

    // ================================
    // Git & Design Operations
    // ================================

    /**
     * Update git information
     */
    updateGit: async (gitInfo: GitInfo, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateGit',
                requestId,
                message: { gitInfo, workspacePath }
            },
            'projectStructureUpdateGitResponse'
        );
    },

    /**
     * Update design guidelines for a package
     */
    updateDesignGuidelines: async (packageId: string, guidelines: DesignGuidelines, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateDesignGuidelines',
                requestId,
                message: { packageId, guidelines, workspacePath }
            },
            'projectStructureUpdateDesignGuidelinesResponse'
        );
    },

    /**
     * Update frontend framework for a package
     */
    updateFrontendFramework: async (packageId: string, framework: FrameworkInfo, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateFrontendFramework',
                requestId,
                message: { packageId, framework, workspacePath }
            },
            'projectStructureUpdateFrontendFrameworkResponse'
        );
    },

    /**
     * Update a specific section of a package
     */
    updateSection: async (packageId: string, section: string, sectionData: any, workspacePath?: string): Promise<ProjectStructureUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'projectStructureEvent',
                action: 'projectStructure.updateSection',
                requestId,
                message: { packageId, section, sectionData, workspacePath }
            },
            'projectStructureUpdateSectionResponse'
        );
    }
};

export default codeboltProjectStructure;
