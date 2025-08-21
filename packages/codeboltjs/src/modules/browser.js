"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * A module for interacting with a browser through WebSockets.
 */
const cbbrowser = {
    /**
     * Opens a new page in the browser.
     */
    newPage: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.NEW_PAGE
        }, enum_1.BrowserResponseType.NEW_PAGE_RESPONSE);
    },
    /**
     * Retrieves the current URL of the browser's active page.
     * @returns {Promise<UrlResponse>} A promise that resolves with the URL.
     */
    getUrl: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_URL
        }, enum_1.BrowserResponseType.GET_URL_RESPONSE);
    },
    /**
     * Navigates to a specified URL.
     * @param {string} url - The URL to navigate to.
     * @returns {Promise<GoToPageResponse>} A promise that resolves when navigation is complete.
     */
    goToPage: (url) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GO_TO_PAGE,
            url
        }, enum_1.BrowserResponseType.GO_TO_PAGE_RESPONSE);
    },
    /**
     * Takes a screenshot of the current page.
     */
    screenshot: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.SCREENSHOT
        }, enum_1.BrowserResponseType.SCREENSHOT_RESPONSE);
    },
    /**
     * Retrieves the HTML content of the current page.
     * @returns {Promise<HtmlReceived>} A promise that resolves with the HTML content.
     */
    getHTML: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_HTML
        }, enum_1.BrowserResponseType.HTML_RECEIVED);
    },
    /**
     * Retrieves the Markdown content of the current page.
     * @returns {Promise<GetMarkdownResponse>} A promise that resolves with the Markdown content.
     */
    getMarkdown: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_MARKDOWN
        }, enum_1.BrowserResponseType.GET_MARKDOWN_RESPONSE);
    },
    /**
     * Retrieves the PDF content of the current page.
     *
     */
    getPDF: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_PDF
        });
    },
    /**
     * Converts the PDF content of the current page to text.
     */
    pdfToText: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.PDF_TO_TEXT
        });
    },
    /**
     * Retrieves the content of the current page.
     *  @returns {Promise<GetContentResponse>} A promise that resolves with the content.
     */
    getContent: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_CONTENT
        }, enum_1.BrowserResponseType.GET_CONTENT_RESPONSE);
    },
    /**
     * Retrieves the snapshot of the current page.
     *  @returns {Promise<BrowserSnapshotResponse>} A promise that resolves with the snapshot.
     */
    getSnapShot: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_SNAPSHOT
        }, enum_1.BrowserResponseType.GET_SNAPSHOT_RESPONSE);
    },
    /**
     * Retrieves browser info like height width scrollx scrolly of the current page.
     *  @returns {Promise<BrowserInfoResponse>} A promise that resolves with the browser info.
     */
    getBrowserInfo: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.GET_BROWSER_INFO
        }, enum_1.BrowserResponseType.GET_BROWSER_INFO_RESPONSE);
    },
    /**
     * Extracts text from the current page.
     *  @returns {Promise<ExtractTextResponse>} A promise that resolves with the extracted text.
     *
     */
    extractText: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.EXTRACT_TEXT
        }, enum_1.BrowserResponseType.EXTRACT_TEXT_RESPONSE);
    },
    /**
     * Closes the current page.
     */
    close: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.CLOSE
        });
    },
    /**
     * Scrolls the current page in a specified direction by a specified number of pixels.
     * @param {string} direction - The direction to scroll.
     * @param {string} pixels - The number of pixels to scroll.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the scroll action is complete.
     */
    scroll: (direction, pixels) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.SCROLL,
            direction,
            pixels
        }, enum_1.BrowserResponseType.SCROLL_RESPONSE);
    },
    /**
     * Types text into a specified element on the page.
     * @param {string} elementid - The ID of the element to type into.
     * @param {string} text - The text to type.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the typing action is complete.
     */
    type: (elementid, text) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.TYPE,
            text,
            elementid
        }, enum_1.BrowserResponseType.TYPE_RESPONSE);
    },
    /**
     * Clicks on a specified element on the page.
     * @param {string} elementid - The ID of the element to click.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the click action is complete.
     */
    click: (elementid) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.CLICK,
            elementid
        }, enum_1.BrowserResponseType.CLICK_RESPONSE);
    },
    /**
     * Simulates the Enter key press on the current page.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the Enter action is complete.
     */
    enter: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.ENTER
        }, enum_1.BrowserResponseType.ENTER_RESPONSE);
    },
    /**
     * Performs a search on the current page using a specified query.
     * @param {string} elementid - The ID of the element to perform the search in.
     * @param {string} query - The search query.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves with the search results.
     */
    search: (elementid, query) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.BROWSER_EVENT,
            action: enum_1.BrowserAction.SEARCH,
            elementid,
            query
        }, enum_1.BrowserResponseType.SEARCH_RESPONSE);
    }
};
exports.default = cbbrowser;
/***

start_browser(objective: string, url: string, previous_command: string, browser_content: string) {
    cbbrowser.newPage();
}
 */ 
