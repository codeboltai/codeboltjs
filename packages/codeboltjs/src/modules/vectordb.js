"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("@codebolt/types/enum");
const websocket_1 = __importDefault(require("../core/websocket"));
const VectorDB = {
    /**
     * Retrieves a vector from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to retrieve.
     * @returns {Promise<GetVectorResponse>} A promise that resolves with the retrieved vector.
     */
    getVector: async (key) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.VECTOR_DB_EVENT,
            "action": enum_1.VectorDBAction.GET_VECTOR,
            "message": {
                item: key
            },
        }, enum_1.VectorDBResponseType.GET_VECTOR_RESPONSE);
    },
    /**
     * Adds a new vector item to the vector database.
     *

     * @param {any} item - The item to add to the vector.
     * @returns {Promise<AddVectorItemResponse>} A promise that resolves when the item is successfully added.
     */
    addVectorItem: async (item) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.VECTOR_DB_EVENT,
            "action": enum_1.VectorDBAction.ADD_VECTOR_ITEM,
            "message": {
                item: item
            },
        }, enum_1.VectorDBResponseType.ADD_VECTOR_ITEM_RESPONSE);
    },
    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItem: async (key) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.VECTOR_DB_EVENT,
            "action": enum_1.VectorDBAction.QUERY_VECTOR_ITEM,
            "message": {
                item: key
            },
        }, enum_1.VectorDBResponseType.QUERY_VECTOR_ITEM_RESPONSE);
    },
    /**
     * Queries a vector item from the vector database based on the provided key.
     *
     * @param {string} key - The key of the vector to query the item from.
     * @returns {Promise<QueryVectorItemResponse>} A promise that resolves with the queried vector item.
     */
    queryVectorItems: async (items, dbPath) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.VECTOR_DB_EVENT,
            "action": enum_1.VectorDBAction.QUERY_VECTOR_ITEMS,
            "message": {
                items,
                dbPath
            },
        }, enum_1.VectorDBResponseType.QUERY_VECTOR_ITEMS_RESPONSE);
    },
};
exports.default = VectorDB;
