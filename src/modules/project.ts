import cbws from './websocket';

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
     * @returns {Promise<any>} A promise that resolves with the project path response.
     */
    getProjectPath: (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "settingEvent",
                "action": "getProjectPath"
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getProjectPathResponse") {
                    resolve(response);
                }
            });
        });
    }
};
export default cbproject