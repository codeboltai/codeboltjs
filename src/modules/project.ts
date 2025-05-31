import cbws from '../core/websocket';
import { GetProjectPathResponse } from '@codebolt/types';
/**
 * A module for interacting with project settings and paths.
 */
const cbproject = {
    /**
     * Placeholder for a method to get project settings.
     * Currently, this method does not perform any operations.
     * @param {any} output - The output where project settings would be stored.
     */
    getProjectSettings: (output: any) => {
        // Implementation for getting project settings will be added here
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