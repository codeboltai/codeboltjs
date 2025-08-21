"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * Tokenizer module for handling token-related operations.
 */
const tokenizer = {
    /**
     * Adds a token to the system via WebSocket.
     * @param {string} key - The key associated with the token to be added.
     * @returns {Promise<AddTokenResponse>} A promise that resolves with the response from the add token event.
     */
    addToken: async (key) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.TOKENIZER_EVENT,
            "action": enum_1.TokenizerAction.ADD_TOKEN,
            "message": {
                item: key
            },
        }, enum_1.TokenizerResponseType.ADD_TOKEN_RESPONSE);
    },
    /**
     * Retrieves a token from the system via WebSocket.
     * @param {string} key - The key associated with the token to be retrieved.
     * @returns {Promise<GetTokenResponse>} A promise that resolves with the response from the get token event.
     */
    getToken: async (key) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.TOKENIZER_EVENT,
            "action": enum_1.TokenizerAction.GET_TOKEN,
            "message": {
                item: key
            },
        }, enum_1.TokenizerResponseType.GET_TOKEN_RESPONSE);
    }
};
exports.default = tokenizer;
