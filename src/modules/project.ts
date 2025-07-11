import cbws from '../core/websocket';
import { GetProjectPathResponse, GetProjectSettingsResponse } from '../types/socketMessageTypes';
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
                "type": "settingEvent",
                "action": "getProjectSettings"
            },
            "getProjectSettingsResponse"
        );
    },
    /**
     * Retrieves the path of the current project.
     * @returns {Promise<GetProjectPathResponse>} A promise that resolves with the project path response.
     */
    getProjectPath: (): Promise<GetProjectPathResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "settingEvent",
                "action": "getProjectPath"
            },
            "getProjectPathResponse"
        );
    },
    getRepoMap: (message: any): Promise<GetProjectPathResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "settingEvent",
                "action": "getRepoMap",
                message
            },
            "getRepoMapResponse"
        );
    },
    runProject: () => {
        cbws.messageManager.send({
            "type": "runProject"
        });
    },
    getEditorFileStatus:()=>{
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "settingEvent",
                "action": "getEditorFileStatus",
            },
            "getEditorFileStatusResponse"
        ); 
    }
};
export default cbproject