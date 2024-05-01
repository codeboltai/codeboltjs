import cbws from './websocket';

/**
 * Fetches the list of tasks asynchronously.
 * @returns {Promise<any>} A promise that resolves with the list of tasks.
 */
const taskplaner = {
    getTasks: async (): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "getTasks",
                
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getTasksResponse") {
                    resolve(response); // Resolve the Promise with the task data
                }
            });
        });
    }
};

export default taskplaner;
