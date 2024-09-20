"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VectorDB {
    constructor(wsManager) {
        /**
         * Retrieves a vector from the vector database based on the provided key.
         *
         * @param {string} key - The key of the vector to retrieve.
         * @returns {Promise<GetVectorResponse>} A promise that resolves with the retrieved vector.
         */
        this.getVector = async (key) => {
            return new Promise((resolve, reject) => {
                this.ws.send(JSON.stringify({
                    "type": "vectordbEvent",
                    "action": "getVector",
                    "message": {
                        item: key
                    },
                }));
                this.ws.on('message', (data) => {
                    const response = JSON.parse(data);
                    if (response.type === "getVectorResponse") {
                        resolve(response);
                    }
                });
            });
        };
        /**
         * Adds a new vector item to the vector database.
         *
    
         * @param {any} item - The item to add to the vector.
         * @returns {Promise<AddVectorItemResponse>} A promise that resolves when the item is successfully added.
         */
        this.addVectorItem = async (item) => {
            return new Promise((resolve, reject) => {
                this.ws.send(JSON.stringify({
                    "type": "vectordbEvent",
                    "action": "addVectorItem",
                    "message": {
                        item: item
                    },
                }));
                this.ws.on('message', (data) => {
                    const response = JSON.parse(data);
                    if (response.type === "addVectorItemResponse") {
                        resolve(response);
                    }
                });
            });
        };
        /**
         * Queries a vector item from the vector database based on the provided key.
         *
         * @param {string} key - The key of the vector to query the item from.
         * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
         */
        this.queryVectorItem = async (key) => {
            return new Promise((resolve, reject) => {
                this.ws.send(JSON.stringify({
                    "type": "vectordbEvent",
                    "action": "queryVectorItem",
                    "message": {
                        item: key
                    },
                }));
                this.ws.on('message', (data) => {
                    const response = JSON.parse(data);
                    if (response.type === "qeryVectorItemResponse") {
                        resolve(response);
                    }
                });
            });
        };
        /**
         * Queries a vector item from the vector database based on the provided key.
         *
         * @param {string} key - The key of the vector to query the item from.
         * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
         */
        this.queryVectorItems = async (items, dbPath) => {
            return new Promise((resolve, reject) => {
                this.ws.send(JSON.stringify({
                    "type": "vectordbEvent",
                    "action": "queryVectorItems",
                    "message": {
                        items,
                        dbPath
                    },
                }));
                this.ws.on('message', (data) => {
                    const response = JSON.parse(data);
                    if (response.type === "qeryVectorItemsResponse") {
                        resolve(response);
                    }
                });
            });
        };
        this.wsManager = wsManager;
        this.ws = this.wsManager.getWebsocket();
    }
}
;
exports.default = VectorDB;
