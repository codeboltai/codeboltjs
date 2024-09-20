import WebSocket from 'ws';
import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Class representing a WebSocket connection.
 */
class CbWS {
   private websocket: WebSocket | null = null;

    /**
     * Constructs a new cbws instance and initializes the WebSocket connection.
     */
    async connect(): Promise<WebSocket> {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return this.websocket;
        }

        const uniqueConnectionId = this.getUniqueConnectionId();
        const initialMessage = this.getInitialMessage();
        this.websocket = new WebSocket(`ws://localhost:12345/codebolt?id=${uniqueConnectionId}`);
        return await this.initializeWebSocket(initialMessage);
    }

    async disconnect(): Promise<void> {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }
    private getUniqueConnectionId(): string {
        try {
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            return data.unique_connectionid;
        } catch (e) {
            console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }

    private getInitialMessage(): string {
        try {
            let fileContents = fs.readFileSync('./codeboltagent.yaml', 'utf8');
            let data: any = yaml.load(fileContents);
            return data.initial_message;
        } catch (e) {
            console.error('Unable to locate codeboltagent.yaml file.');
            return '';
        }
    }

    /**
     * Initializes the WebSocket by setting up event listeners and returning a promise that resolves
     * when the WebSocket connection is successfully opened.
     * @returns {Promise<WebSocket>} A promise that resolves with the WebSocket instance.
     */
    private async initializeWebSocket(initialMessage: string): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            if (!this.websocket) {
                reject(new Error('WebSocket is not initialized'));
                return;
            }
            this.websocket.on('error', (error: Error) => {
                console.log('WebSocket error:', error);
                reject(error);
            });

            this.websocket.on('open', () => {
                console.log('WebSocket connected');
                resolve(this.websocket!);
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
    getWebsocket(): WebSocket {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }
        return this.websocket;
    }
}

export default CbWS;
