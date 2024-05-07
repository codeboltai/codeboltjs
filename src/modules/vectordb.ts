import cbws from './websocket';

const VectorDB = {
    /**
     * Retrieves a vector from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to retrieve.
     * @returns {Promise<any>} A promise that resolves with the retrieved vector.
     */
    getVector: async (key: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "getVector",
                "message": {
                    item: key
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getVectorResponse") {
                    resolve(response);
                }
            });
        });
    },

    /**
     * Adds a new vector item to the vector database.
     *

     * @param {any} item - The item to add to the vector.
     * @returns {Promise<any>} A promise that resolves when the item is successfully added.
     */
    addVectorItem: async ( item: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "addVectorItem",
                "message": {
                    item: item
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "addVectorItemResponse") {
                    resolve(response);
                }
            });
        });
    },

    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<any>} A promise that resolves with the queried vector item.
     */
    queryVectorItem: async (key: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "queryVectorItem",
                "message": {
                    item: key
                },
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "qeryVectorItemResponse") {
                    resolve(response);
                }
            });
        });
    },
};

export default VectorDB;
