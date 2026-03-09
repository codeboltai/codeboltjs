import cbws from '../core/websocket';
import { EnvironmentAction, EnvironmentResponseType } from '@codebolt/types/enum';

/**
 * A module for managing environments (create, start, stop, restart, etc.)
 */
const cbenvironment = {
    /**
     * List all environments.
     * @returns A promise that resolves with the list of environments.
     */
    listEnvironments: (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.LIST_ENVIRONMENTS}`,
            },
            EnvironmentResponseType.LIST_ENVIRONMENTS_RESPONSE
        );
    },

    /**
     * Get an environment by ID.
     * @param environmentId - The ID of the environment to retrieve.
     * @returns A promise that resolves with the environment data.
     */
    getEnvironment: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.GET_ENVIRONMENT}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.GET_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Create a new environment.
     * @param environmentData - The environment configuration data including name and provider.
     * @returns A promise that resolves with the created environment.
     */
    createEnvironment: (environmentData: {
        name: string;
        description?: string;
        provider: any;
        config?: any;
    }): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.CREATE_ENVIRONMENT}`,
                "params": { environmentData },
            },
            EnvironmentResponseType.CREATE_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Update an existing environment.
     * @param environmentId - The ID of the environment to update.
     * @param updateData - The data to update.
     * @returns A promise that resolves with the updated environment.
     */
    updateEnvironment: (environmentId: string, updateData: any): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.UPDATE_ENVIRONMENT}`,
                "params": { id: environmentId, updateData },
            },
            EnvironmentResponseType.UPDATE_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Delete an environment.
     * @param environmentId - The ID of the environment to delete.
     * @returns A promise that resolves with the deletion result.
     */
    deleteEnvironment: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.DELETE_ENVIRONMENT}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.DELETE_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Start an environment (starts its provider process).
     * @param environmentId - The ID of the environment to start.
     * @returns A promise that resolves when the environment is started.
     */
    startEnvironment: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.START_ENVIRONMENT}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.START_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Stop an environment (stops its provider process).
     * @param environmentId - The ID of the environment to stop.
     * @returns A promise that resolves when the environment is stopped.
     */
    stopEnvironment: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.STOP_ENVIRONMENT}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.STOP_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Restart an environment (stops then starts its provider process).
     * @param environmentId - The ID of the environment to restart.
     * @returns A promise that resolves when the environment is restarted.
     */
    restartEnvironment: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.RESTART_ENVIRONMENT}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.RESTART_ENVIRONMENT_RESPONSE
        );
    },

    /**
     * Get the status of an environment.
     * @param environmentId - The ID of the environment.
     * @returns A promise that resolves with the environment status.
     */
    getEnvironmentStatus: (environmentId: string): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.GET_ENVIRONMENT_STATUS}`,
                "params": { id: environmentId },
            },
            EnvironmentResponseType.GET_ENVIRONMENT_STATUS_RESPONSE
        );
    },

    /**
     * Get all running environment providers.
     * @returns A promise that resolves with the list of running provider IDs.
     */
    getRunningProviders: (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.GET_RUNNING_PROVIDERS}`,
            },
            EnvironmentResponseType.GET_RUNNING_PROVIDERS_RESPONSE
        );
    },

    /**
     * Get local project providers.
     * @returns A promise that resolves with the list of local providers.
     */
    getLocalProviders: (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.GET_LOCAL_PROVIDERS}`,
            },
            EnvironmentResponseType.GET_LOCAL_PROVIDERS_RESPONSE
        );
    },

    /**
     * Get environment statistics.
     * @returns A promise that resolves with environment statistics.
     */
    getEnvironmentStatistics: (): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.GET_ENVIRONMENT_STATISTICS}`,
            },
            EnvironmentResponseType.GET_ENVIRONMENT_STATISTICS_RESPONSE
        );
    },

    /**
     * Send a message to an environment provider.
     * @param environmentId - The ID of the target environment.
     * @param message - The message to send.
     * @returns A promise that resolves with the send result.
     */
    sendMessageToEnvironment: (environmentId: string, message: any): Promise<any> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": `environment.${EnvironmentAction.SEND_MESSAGE_TO_ENVIRONMENT}`,
                "params": { id: environmentId, message },
            },
            EnvironmentResponseType.SEND_MESSAGE_TO_ENVIRONMENT_RESPONSE
        );
    },
};

export default cbenvironment;
