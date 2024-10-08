import cbws from './websocket';
import { GetProjectPathResponse } from '@codebolt/types';

import CbWS from './websocket';

class CustomEventEmitter extends EventEmitter { }
import { EventEmitter } from 'events';
/**
 * A module for interacting with project settings and paths.
 */


class CBProject{
    private wsManager: CbWS;
    private ws: any;
    private eventEmitter: CustomEventEmitter;

    constructor(wsManager: CbWS) {
        this.wsManager = wsManager;
        // this.ws = this.wsManager.getWebsocket();
        this.eventEmitter = new CustomEventEmitter();
    }
    /**
     * Placeholder for a method to get project settings.
     * Currently, this method does not perform any operations.
     * @param {any} output - The output where project settings would be stored.
     */
    getProjectSettings=(output: any) => {
        // Implementation for getting project settings will be added here
    }
    /**
     * Retrieves the path of the current project.
     * @returns {Promise<GetProjectPathResponse>} A promise that resolves with the project path response.
     */
    getProjectPath= (): Promise<GetProjectPathResponse> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "settingEvent",
                "action": "getProjectPath"
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getProjectPathResponse") {
                    resolve(response);
                }
            });
        });
    }
    getRepoMap= (message: any): Promise<GetProjectPathResponse> => {
        return new Promise((resolve, reject) => {
             this.wsManager.send(JSON.stringify({
                "type": "settingEvent",
                "action": "getRepoMap",
                message
            }));
             this.wsManager.on((data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getRepoMapResponse") {
                    resolve(response);
                }
            });
        });
    }
    runProject= () => {
         this.wsManager.send(JSON.stringify({
            "type": "runProject"
        }));
    }
};
export default CBProject