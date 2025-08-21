import { GetProjectPathResponse, GetProjectSettingsResponse } from '@codebolt/types/sdk';
/**
 * A module for interacting with project settings and paths.
 */
declare const cbproject: {
    /**
     * Retrieves the project settings from the server.
     * @returns {Promise<GetProjectSettingsResponse>} A promise that resolves with the project settings response.
     */
    getProjectSettings: () => Promise<GetProjectSettingsResponse>;
    /**
     * Retrieves the path of the current project.
     * @returns {Promise<GetProjectPathResponse>} A promise that resolves with the project path response.
     */
    getProjectPath: () => Promise<GetProjectPathResponse>;
    getRepoMap: (message: any) => Promise<GetProjectPathResponse>;
    runProject: () => void;
    getEditorFileStatus: () => Promise<any>;
};
export default cbproject;
