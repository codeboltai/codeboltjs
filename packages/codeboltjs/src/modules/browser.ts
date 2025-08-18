import cbws from '../core/websocket';
import { EventType, BrowserAction, BrowserResponseType } from '@codebolt/types';
import { 
    BrowserNewPageSuccessResponse, BrowserNewPageErrorResponse,
    BrowserGoToPageSuccessResponse, BrowserGoToPageErrorResponse,
    BrowserGetUrlSuccessResponse, BrowserGetUrlErrorResponse,
    BrowserScreenshotSuccessResponse, BrowserScreenshotErrorResponse,
    BrowserGetHtmlSuccessResponse, BrowserGetHtmlErrorResponse,
    BrowserGetMarkdownSuccessResponse, BrowserGetMarkdownErrorResponse,
    BrowserGetContentSuccessResponse, BrowserGetContentErrorResponse,
    BrowserExtractTextSuccessResponse, BrowserExtractTextErrorResponse
} from '../types/libFunctionTypes';

/**
 * A module for interacting with a browser through WebSockets.
 */
const cbbrowser = {

    /**
     * Opens a new page in the browser.
     */
    newPage: (): Promise<BrowserNewPageSuccessResponse> => {
       
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.NEW_PAGE
            },
            BrowserResponseType.NEW_PAGE_RESPONSE
        );
    },

    /**
     * Retrieves the current URL of the browser's active page.
     * @returns {Promise<BrowserGetUrlSuccessResponse>} A promise that resolves with the URL.
     */
    getUrl: (): Promise<BrowserGetUrlSuccessResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_URL
            },
            BrowserResponseType.GET_URL_RESPONSE
        );
    },

    /**
     * Navigates to a specified URL.
     * @param {string} url - The URL to navigate to.
     * @returns {Promise<BrowserGoToPageSuccessResponse>} A promise that resolves when navigation is complete.
     */
    goToPage: (url: string): Promise<BrowserGoToPageSuccessResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GO_TO_PAGE,
                url
            },
            BrowserResponseType.GO_TO_PAGE_RESPONSE
        );
    },

    /**
     * Takes a screenshot of the current page.
     */
    screenshot: (): Promise<BrowserScreenshotSuccessResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.SCREENSHOT
        },
            BrowserResponseType.SCREENSHOT_RESPONSE
        );
    },

    /**
     * Retrieves the HTML content of the current page.
     * @returns {Promise<BrowserGetHtmlSuccessResponse>} A promise that resolves with the HTML content.
     */
    getHTML: (): Promise<BrowserGetHtmlSuccessResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_HTML
            },
            BrowserResponseType.HTML_RECEIVED
        );
    },

    /**
     * Retrieves the Markdown content of the current page.
     * @returns {Promise<BrowserGetMarkdownSuccessResponse>} A promise that resolves with the Markdown content.
     */
    getMarkdown: (): Promise<BrowserGetMarkdownSuccessResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_MARKDOWN
            },
            BrowserResponseType.GET_MARKDOWN_RESPONSE
        );
    },

    /**
     * Retrieves the PDF content of the current page.
     * 
     */
    getPDF: (): void => {
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.GET_PDF
        });
    },

    /**
     * Converts the PDF content of the current page to text.
     */
    pdfToText: (): void => {
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.PDF_TO_TEXT
        });
    },

    /**
     * Retrieves the content of the current page.
     *  @returns {Promise<BrowserGetContentSuccessResponse>} A promise that resolves with the content.
     */
    getContent: (): Promise<BrowserGetContentSuccessResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_CONTENT
            },
            BrowserResponseType.GET_CONTENT_RESPONSE
        );
    },
    /**
     * Retrieves the snapshot of the current page.
     *  @returns {Promise<BrowserSnapshotResponse>} A promise that resolves with the snapshot.
     */
    getSnapShot: (): Promise<BrowserSnapshotResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_SNAPSHOT
            },
            BrowserResponseType.GET_SNAPSHOT_RESPONSE
        );
    },
    /**
     * Retrieves browser info like height width scrollx scrolly of the current page.
     *  @returns {Promise<BrowserInfoResponse>} A promise that resolves with the browser info.
     */
    getBrowserInfo: (): Promise<BrowserInfoResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_BROWSER_INFO
            },
            BrowserResponseType.GET_BROWSER_INFO_RESPONSE
        );
    },

    /**
     * Extracts text from the current page.
     *  @returns {Promise<BrowserExtractTextSuccessResponse>} A promise that resolves with the extracted text.
     * 
     */
    extractText: (): Promise<BrowserExtractTextSuccessResponse> => {
        
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.EXTRACT_TEXT
            },
            BrowserResponseType.EXTRACT_TEXT_RESPONSE
        );
    },

    /**
     * Closes the current page.
     */
    close: (): void => {
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.CLOSE
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
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.SCROLL,
                direction,
                pixels
            },
            BrowserResponseType.SCROLL_RESPONSE
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
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.TYPE,
                text,
                elementid
            },
            BrowserResponseType.TYPE_RESPONSE
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
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.CLICK,
                elementid
            },
            BrowserResponseType.CLICK_RESPONSE
        );
    },

    /**
     * Simulates the Enter key press on the current page.
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the Enter action is complete.
     */
    enter: (): Promise<BrowserActionResponseData> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.ENTER
            },
            BrowserResponseType.ENTER_RESPONSE
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
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.SEARCH,
                elementid,
                query
            },
            BrowserResponseType.SEARCH_RESPONSE
        );
    }
}

export default cbbrowser;



/***

start_browser(objective: string, url: string, previous_command: string, browser_content: string) {
    cbbrowser.newPage();
}
 */