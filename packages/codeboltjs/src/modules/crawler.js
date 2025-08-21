"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
/**
 * A module for controlling a web crawler through WebSocket messages.
 */
const cbcrawler = {
    /**
     * Starts the crawler.
     */
    start: () => {
        websocket_1.default.messageManager.send({
            "type": "crawlerEvent",
            action: 'start'
        });
    },
    /**
     * Takes a screenshot using the crawler.
     */
    screenshot: () => {
        websocket_1.default.messageManager.send({
            "type": "crawlerEvent",
            action: 'screenshot'
        });
    },
    /**
     * Directs the crawler to navigate to a specified URL.
     * @param url - The URL for the crawler to navigate to.
     */
    goToPage: (url) => {
        websocket_1.default.messageManager.send({
            "type": "crawlerEvent",
            action: 'goToPage',
            url
        });
    },
    /**
     * Scrolls the crawler in a specified direction.
     * @param direction - The direction to scroll ('up', 'down', 'left', 'right').
     */
    scroll: (direction) => {
        websocket_1.default.messageManager.send({
            "type": "crawlerEvent",
            action: 'scroll',
            direction
        });
    },
    /**
     * Simulates a click event on an element with the specified ID.
     * @param id - The ID of the element to be clicked.
     * @returns {Promise<any>} A promise that resolves when the click action is complete.
     */
    click: (id) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": "crawlerEvent",
            action: 'click',
            id
        }, "crawlResponse");
    }
};
exports.default = cbcrawler;
