import cbws from '../core/websocket';
import { GoToPageResponse, UrlResponse, GetMarkdownResponse, HtmlReceived, ExtractTextResponse, GetContentResponse, BrowserActionResponseData, BrowserScreenshotResponse, BrowserInfoResponse, BrowserSnapshotResponse } from '../types/socketMessageTypes';
/**
 * A module for interacting with a browser through WebSockets.
 */
const cbbrowser = {

    /**
     * Opens a new page in the browser.
     */
    newPage: (): Promise<BrowserActionResponseData> => {
       
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'newPage'
            },
            "newPageResponse"
        );
    },

    /**
     * Retrieves the current URL of the browser's active page.
     * @returns {Promise<UrlResponse>} A promise that resolves with the URL.
     */
    getUrl: (): Promise<UrlResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getUrl'
            },
            "getUrlResponse"
        );
    },

    /**
     * Navigates to a specified URL.
     * @param {string} url - The URL to navigate to.
     * @returns {Promise<GoToPageResponse>} A promise that resolves when navigation is complete.
     */
    goToPage: (url: string): Promise<GoToPageResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'goToPage',
                url
            },
            "goToPageResponse"
        );
    },

    /**
     * Takes a screenshot of the current page.
     */
    screenshot: (): Promise<BrowserScreenshotResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
            "type": "browserEvent",
            action: 'screenshot'
        },
            "screenshotResponse"
        );
    },

    /**
     * Retrieves the HTML content of the current page.
     * @returns {Promise<HtmlReceived>} A promise that resolves with the HTML content.
     */
    getHTML: (): Promise<HtmlReceived> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getHTML'
            },
            "htmlReceived"
        );
    },

    /**
     * Retrieves the Markdown content of the current page.
     * @returns {Promise<GetMarkdownResponse>} A promise that resolves with the Markdown content.
     */
    getMarkdown: (): Promise<GetMarkdownResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getMarkdown'
            },
            "getMarkdownResponse"
        );
    },

    /**
     * Retrieves the PDF content of the current page.
     * 
     */
    getPDF: (): void => {
        cbws.messageManager.send({
            "type": "browserEvent",
            action: 'getPDF'
        });
    },

    /**
     * Converts the PDF content of the current page to text.
     */
    pdfToText: (): void => {
        cbws.messageManager.send({
            "type": "browserEvent",
            action: 'pdfToText'
        });
    },

    /**
     * Retrieves the content of the current page.
     *  @returns {Promise<GetContentResponse>} A promise that resolves with the content.
     */
    getContent: (): Promise<GetContentResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getContent'
            },
            "getContentResponse"
        );
    },
    /**
     * Retrieves the snapshot of the current page.
     *  @returns {Promise<BrowserSnapshotResponse>} A promise that resolves with the snapshot.
     */
    getSnapShot: (): Promise<BrowserSnapshotResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getSnapShot'
            },
            "getSnapShotResponse"
        );
    },
    /**
     * Retrieves browser info like height width scrollx scrolly of the current page.
     *  @returns {Promise<BrowserInfoResponse>} A promise that resolves with the browser info.
     */
    getBrowserInfo: (): Promise<BrowserInfoResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'getBrowserInfo'
            },
            "getBrowserInfoResponse"
        );
    },

    /**
     * Extracts text from the current page.
     *  @returns {Promise<ExtractTextResponse>} A promise that resolves with the extracted text.
     * 
     */
    extractText: (): Promise<ExtractTextResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'extractText'
            },
            "extractTextResponse"
        );
    },

    /**
     * Closes the current page.
     */
    close: (): void => {
        cbws.messageManager.send({
            "type": "browserEvent",
            action: 'close'
        });
    },

    /**
     * Scrolls the current page in a specified direction by a specified number of pixels.
     * @param {string} direction - The direction to scroll.
     * @param {string} pixels - The number of pixels to scroll.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the scroll action is complete.
     */
    scroll: (direction: string, pixels: string): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'scroll',
                direction,
                pixels
            },
            "scrollResponse"
        );
    },

    /**
     * Types text into a specified element on the page.
     * @param {string} elementid - The ID of the element to type into.
     * @param {string} text - The text to type.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the typing action is complete.
     */
    type: (elementid: string, text: string): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'type',
                text,
                elementid
            },
            "typeResponse"
        );
    },

    /**
     * Clicks on a specified element on the page.
     * @param {string} elementid - The ID of the element to click.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the click action is complete.
     */
    click: (elementid: string): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'click',
                elementid
            },
            "clickResponse"
        );
    },

    /**
     * Simulates the Enter key press on the current page.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the Enter action is complete.
     */
    enter: (): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'enter'
            },
            "EnterResponse"
        );
    },

    /**
     * Performs a search on the current page using a specified query.
     * @param {string} elementid - The ID of the element to perform the search in.
     * @param {string} query - The search query.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves with the search results.
     */
    search: (elementid: string, query: string): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "browserEvent",
                action: 'search',
                elementid,
                query
            },
            "searchResponse"
        );
    }
}

export default cbbrowser;



/***

start_browser(objective: string, url: string, previous_command: string, browser_content: string) {
    cbbrowser.newPage();
}
 */