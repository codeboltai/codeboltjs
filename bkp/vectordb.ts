import cbws from './websocket';
import { AddVectorItemResponse,GetVectorResponse,QueryVectorItemResponse } from '@codebolt/types';
class VectorDB {
    private wsManager: cbws;
    private ws: WebSocket;

    constructor(wsManager: cbws) {
        this.wsManager = wsManager;
        this.ws = this.wsManager.getWebsocket();
    }
    /**
     * Retrieves a vector from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to retrieve.
     * @returns {Promise<GetVectorResponse>} A promise that resolves with the retrieved vector.
     */
    getVector = async (key: string): Promise<GetVectorResponse> => {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                "type":"vectordbEvent",
                "action": "getVector",
                "message": {
                    item: key
                },
            }));
            this.ws.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getVectorResponse") {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Adds a new vector item to the vector database.
     *

     * @param {any} item - The item to add to the vector.
     * @returns {Promise<AddVectorItemResponse>} A promise that resolves when the item is successfully added.
     */
    addVectorItem =  async ( item: any): Promise<AddVectorItemResponse> => {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                "type":"vectordbEvent",
                "action": "addVectorItem",
                "message": {
                    item: item
                },
            }));
            this.ws.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addVectorItemResponse") {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItem =  async (key: string): Promise<QueryVectorItemResponse> => {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                "type":"vectordbEvent",
                "action": "queryVectorItem",
                "message": {
                    item: key
                },
            }));
            this.ws.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "qeryVectorItemResponse") {
                    resolve(response);
                }
            });
        });
    }
    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItems = async (items: [],dbPath:string): Promise<QueryVectorItemResponse> => {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                "type":"vectordbEvent",
                "action": "queryVectorItems",
                "message": {
                    items,
                    dbPath
                },
            }));
            this.ws.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "qeryVectorItemsResponse") {
                    resolve(response);
                }
            });
        });
    }
};

export default VectorDB;
