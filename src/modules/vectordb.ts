import cbws from '../core/websocket';
import { AddVectorItemResponse, GetVectorResponse, QueryVectorItemResponse } from '../types/cliWebSocketInterfaces';
const VectorDB = {
    /**
     * Retrieves a vector from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to retrieve.
     * @returns {Promise<GetVectorResponse>} A promise that resolves with the retrieved vector.
     */
    getVector: async (key: string): Promise<GetVectorResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"vectordbEvent",
                "action": "getVector",
                "message": {
                    item: key
                },
            },
            "getVectorResponse"
        );
    },

    /**
     * Adds a new vector item to the vector database.
     *

     * @param {any} item - The item to add to the vector.
     * @returns {Promise<AddVectorItemResponse>} A promise that resolves when the item is successfully added.
     */
    addVectorItem: async ( item: any): Promise<AddVectorItemResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"vectordbEvent",
                "action": "addVectorItem",
                "message": {
                    item: item
                },
            },
            "addVectorItemResponse"
        );
    },

    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItem: async (key: string): Promise<QueryVectorItemResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"vectordbEvent",
                "action": "queryVectorItem",
                "message": {
                    item: key
                },
            },
            "qeryVectorItemResponse"
        );
    },
    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItems: async (items: [],dbPath:string): Promise<QueryVectorItemResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type":"vectordbEvent",
                "action": "queryVectorItems",
                "message": {
                    items,
                    dbPath
                },
            },
            "qeryVectorItemsResponse"
        );
    },
};

export default VectorDB;
