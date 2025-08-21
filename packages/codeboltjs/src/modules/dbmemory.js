"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("@codebolt/types/enum");
const websocket_1 = __importDefault(require("../core/websocket"));
/**
 * A module for handling in-memory database operations via WebSocket.
 */
const dbmemory = {
    /**
     * Adds a key-value pair to the in-memory database.
     * @param {string} key - The key under which to store the value.
     * @param {MemoryValue} value - The value to be stored.
     * @returns {Promise<MemorySetResponse>} A promise that resolves with the response from the memory set event.
     */
    addKnowledge: (key, value) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.MEMORY_EVENT,
            'action': enum_1.MemoryAction.SET_MEMORY,
            key,
            value
        }, enum_1.MemoryResponseType.SET_MEMORY_RESPONSE);
    },
    /**
     * Retrieves a value from the in-memory database by key.
     * @param {string} key - The key of the value to retrieve.
     * @returns {Promise<MemoryGetResponse>} A promise that resolves with the response from the memory get event.
     */
    getKnowledge: (key) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.MEMORY_EVENT,
            'action': enum_1.MemoryAction.GET_MEMORY,
            key
        }, enum_1.MemoryResponseType.GET_MEMORY_RESPONSE);
    }
};
exports.default = dbmemory;
