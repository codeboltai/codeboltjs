import WebSocket from 'ws';
import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Class representing a WebSocket connection.
 */
class cbws {
    websocket: WebSocket;

    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    constructor() {
        const uniqueConnectionId = this.getUniqueConnectionId();
        console.log(uniqueConnectionId)
        this.websocket = new WebSocket(`ws://localhost:12345/codebolt?id=${uniqueConnectionId}`);
        this.initializeWebSocket().catch(error => {
            console.error("WebSocket connection failed:", error);
        });
    }
    private getUniqueConnectionId(): string {
        try {
            let fileContents = fs.readFileSync('./codebotagent.yml', 'utf8');
            let data = yaml.safeLoad(fileContents);
            return data.uniqueConnectionId;
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    private async initializeWebSocket(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            this.websocket.on('error', (error: Error) => {
                console.log('WebSocket error:', error);
                reject(error);
            });

            this.websocket.on('open', () => {
                console.log('WebSocket connected');
                if (this.websocket) {
                    resolve(this.websocket);
                }
            });

            this.websocket.on('message', (data: WebSocket.Data) => {
                // Handle incoming WebSocket messages here.
                // console.log('WebSocket message received:', data);
            });
        });
    }

    /**
     * Getter for the WebSocket instance. Throws an error if the WebSocket is not open.
     * @returns {WebSocket} The WebSocket instance.
     * @throws {Error} If the WebSocket is not open.
     */
    get getWebsocket(): WebSocket {
        if (!this.websocket.OPEN) {
            throw new Error('WebSocket is not open');
        } else {
            return this.websocket;
        }
    }
}

export default new cbws();
