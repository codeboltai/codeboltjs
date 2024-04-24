import cbws from './websocket';

/**
 * A module for executing commands in a terminal-like environment via WebSocket.
 */
const cbterminal = {

    /**
     * Executes a given command and returns the result.
     * Listens for messages from the WebSocket that indicate the output, error, or finish state
     * of the executed command and resolves the promise accordingly.
     *
     * @param {string} command - The command to be executed.
     * @returns {Promise<any>} A promise that resolves with the command's output, error, or finish signal.
     */
    executeCommand: async (command: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "executeCommand",
                "message": command,
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "commandOutput" || response.type === "commandError" || response.type === "commandFinish") {
                    resolve(response);
                }
            });
        });
    }
};
export default cbterminal;