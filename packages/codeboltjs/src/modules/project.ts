import cbws from '../core/websocket';
import { GetProjectPathResponse, GetProjectSettingsResponse } from '@codebolt/types/sdk';

import { EventType, ProjectAction, ProjectResponseType } from '@codebolt/types/enum';
/**
 * A module for interacting with project settings and paths.
 */
const cbproject = {
    /**
     * Retrieves the project settings from the server.
     * @returns {Promise<GetProjectSettingsResponse>} A promise that resolves with the project settings response.
     */
    getProjectSettings: (): Promise<GetProjectSettingsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.PROJECT_EVENT,
                "action": ProjectAction.GET_PROJECT_SETTINGS
            },
            ProjectResponseType.GET_PROJECT_SETTINGS_RESPONSE
        );
    },
    /**
     * Retrieves the path of the current project.
     * @returns {Promise<GetProjectPathResponse>} A promise that resolves with the project path response.
     */
    getProjectPath: (): Promise<GetProjectPathResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.PROJECT_EVENT,
                "action": ProjectAction.GET_PROJECT_PATH
            },
            ProjectResponseType.GET_PROJECT_PATH_RESPONSE
        );
    },
    getRepoMap: (message: any): Promise<GetProjectPathResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.PROJECT_EVENT,
                "action": ProjectAction.GET_REPO_MAP,
                message
            },
            ProjectResponseType.GET_REPO_MAP_RESPONSE
        );
    },
    runProject: () => {
        cbws.messageManager.send({
            "type": EventType.PROJECT_EVENT,
            "action": ProjectAction.RUN_PROJECT
        });
    },
    getEditorFileStatus:()=>{
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.PROJECT_EVENT,
                "action": ProjectAction.GET_EDITOR_FILE_STATUS,
            },
            ProjectResponseType.GET_EDITOR_FILE_STATUS_RESPONSE
        ); 
    }
};
export default cbproject