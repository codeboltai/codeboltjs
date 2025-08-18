import { EventType, VectorDBAction, VectorDBResponseType } from '@codebolt/types';
import cbws from '../core/websocket';
import { AddVectorItemResponse, GetVectorResponse, QueryVectorItemResponse } from '@codebolt/types/sdk';
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
                "type": EventType.VECTOR_DB_EVENT,
                "action": VectorDBAction.GET_VECTOR,
                "message": {
                    item: key
                },
            },
            VectorDBResponseType.GET_VECTOR_RESPONSE
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
                "type": EventType.VECTOR_DB_EVENT,
                "action": VectorDBAction.ADD_VECTOR_ITEM,
                "message": {
                    item: item
                },
            },
            VectorDBResponseType.ADD_VECTOR_ITEM_RESPONSE
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
                "type": EventType.VECTOR_DB_EVENT,
                "action": VectorDBAction.QUERY_VECTOR_ITEM,
                "message": {
                    item: key
                },
            },
            VectorDBResponseType.QUERY_VECTOR_ITEM_RESPONSE
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
                "type": EventType.VECTOR_DB_EVENT,
                "action": VectorDBAction.QUERY_VECTOR_ITEMS,
                "message": {
                    items,
                    dbPath
                },
            },
            VectorDBResponseType.QUERY_VECTOR_ITEMS_RESPONSE
        );
    },
};

export default VectorDB;
