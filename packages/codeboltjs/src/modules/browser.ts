import cbws from '../core/websocket';
import {
    GoToPageResponse,
    UrlResponse,
    GetMarkdownResponse,
    HtmlReceived,
    ExtractTextResponse,
    GetContentResponse,
    BrowserActionResponseData,
    BrowserScreenshotResponse,
    BrowserInfoResponse,
    BrowserSnapshotResponse,
    BrowserOperationType,
    BrowserOperationParams,
    BrowserOperationResponse
} from '@codebolt/types/sdk';
import { EventType, BrowserAction, BrowserResponseType } from '@codebolt/types/enum';
import type { BrowserInstanceOptions, BrowserOperationOptions, BrowserInstanceInfo, BrowserScreenshotOptions } from '../types/libFunctionTypes';

// Re-export types for consumers
export type {
    BrowserOperationType,
    BrowserOperationParams,
    BrowserOperationResponse
};

// Active instance management
let activeInstanceId: string | null = null;

// Helper function to get or create active instance
const getOrCreateActiveInstance = async (): Promise<string> => {
    if (activeInstanceId) {
        // For now, assume the active instance is still valid
        // We'll implement proper checking when we add the instance management functions
        return activeInstanceId;
    }
    
    // Create new instance ID (temporary - will be replaced with proper instance creation)
    const newInstanceId = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    activeInstanceId = newInstanceId;
    return newInstanceId;
};

// Helper function to resolve instance ID
const resolveInstanceId = async (options?: BrowserOperationOptions): Promise<string> => {
    if (options?.instanceId) {
        return options.instanceId;
    }
    return await getOrCreateActiveInstance();
};

/**
 * A module for interacting with a browser through WebSockets.
 */
const cbbrowser = {

    /**
     * Opens a new page in the browser.
     * @param options - Optional browser instance options
     */
    newPage: async (options?: BrowserInstanceOptions): Promise<BrowserActionResponseData> => {
        const instanceId = options?.instanceId || await getOrCreateActiveInstance();
       
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.NEW_PAGE,
                instanceId
            },
            BrowserResponseType.NEW_PAGE_RESPONSE
        );
    },

    /**
     * Retrieves the current URL of the browser's active page.
     * @param options - Optional browser operation options
     * @returns {Promise<UrlResponse>} A promise that resolves with the URL.
     */
    getUrl: async (options?: BrowserOperationOptions): Promise<UrlResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_URL,
                instanceId
            },
            BrowserResponseType.GET_URL_RESPONSE
        );
    },

    /**
     * Navigates to a specified URL.
     * @param {string} url - The URL to navigate to.
     * @param options - Optional browser operation options
     * @returns {Promise<GoToPageResponse>} A promise that resolves when navigation is complete.
     */
    goToPage: async (url: string, options?: BrowserOperationOptions): Promise<GoToPageResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GO_TO_PAGE,
                url,
                instanceId
            },
            BrowserResponseType.GO_TO_PAGE_RESPONSE
        );
    },

    /**
     * Takes a screenshot of the current page.
     * @param options - Optional browser screenshot options
     */
    screenshot: async (options?: BrowserScreenshotOptions): Promise<BrowserScreenshotResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.SCREENSHOT,
                instanceId,
                // Pass through screenshot options
                fullPage: options?.fullPage,
                quality: options?.quality,
                format: options?.format
            },
            BrowserResponseType.SCREENSHOT_RESPONSE
        );
    },

    /**
     * Retrieves the HTML content of the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<HtmlReceived>} A promise that resolves with the HTML content.
     */
    getHTML: async (options?: BrowserOperationOptions): Promise<HtmlReceived> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_HTML,
                instanceId
            },
            BrowserResponseType.HTML_RECEIVED
        );
    },

    /**
     * Retrieves the Markdown content of the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<GetMarkdownResponse>} A promise that resolves with the Markdown content.
     */
    getMarkdown: async (options?: BrowserOperationOptions): Promise<GetMarkdownResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_MARKDOWN,
                instanceId
            },
            BrowserResponseType.GET_MARKDOWN_RESPONSE
        );
    },

    /**
     * Retrieves the PDF content of the current page.
     * @param options - Optional browser operation options
     */
    getPDF: async (options?: BrowserOperationOptions): Promise<void> => {
        const instanceId = await resolveInstanceId(options);
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.GET_PDF,
            instanceId
        });
    },

    /**
     * Converts the PDF content of the current page to text.
     * @param options - Optional browser operation options
     */
    pdfToText: async (options?: BrowserOperationOptions): Promise<void> => {
        const instanceId = await resolveInstanceId(options);
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.PDF_TO_TEXT,
            instanceId
        });
    },

    /**
     * Retrieves the content of the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<GetContentResponse>} A promise that resolves with the content.
     */
    getContent: async (options?: BrowserOperationOptions): Promise<GetContentResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_CONTENT,
                instanceId
            },
            BrowserResponseType.GET_CONTENT_RESPONSE
        );
    },
    /**
     * Retrieves the snapshot of the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserSnapshotResponse>} A promise that resolves with the snapshot.
     */
    getSnapShot: async (options?: BrowserOperationOptions): Promise<BrowserSnapshotResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_SNAPSHOT,
                instanceId
            },
            BrowserResponseType.GET_SNAPSHOT_RESPONSE
        );
    },
    /**
     * Retrieves browser info like height width scrollx scrolly of the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserInfoResponse>} A promise that resolves with the browser info.
     */
    getBrowserInfo: async (options?: BrowserOperationOptions): Promise<BrowserInfoResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.GET_BROWSER_INFO,
                instanceId
            },
            BrowserResponseType.GET_BROWSER_INFO_RESPONSE
        );
    },

    /**
     * Extracts text from the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<ExtractTextResponse>} A promise that resolves with the extracted text.
     */
    extractText: async (options?: BrowserOperationOptions): Promise<ExtractTextResponse> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.EXTRACT_TEXT,
                instanceId
            },
            BrowserResponseType.EXTRACT_TEXT_RESPONSE
        );
    },

    /**
     * Closes the current page.
     * @param options - Optional browser operation options
     */
    close: async (options?: BrowserOperationOptions): Promise<void> => {
        const instanceId = await resolveInstanceId(options);
        cbws.messageManager.send({
            "type": EventType.BROWSER_EVENT,
            action: BrowserAction.CLOSE,
            instanceId
        });
    },

    /**
     * Scrolls the current page in a specified direction by a specified number of pixels.
     * @param {string} direction - The direction to scroll.
     * @param {string} pixels - The number of pixels to scroll.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the scroll action is complete.
     */
    scroll: async (direction: string, pixels: string, options?: BrowserOperationOptions): Promise<BrowserActionResponseData> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.SCROLL,
                direction,
                pixels,
                instanceId
            },
            BrowserResponseType.SCROLL_RESPONSE
        );
    },

    /**
     * Types text into a specified element on the page.
     * @param {string} elementid - The ID of the element to type into.
     * @param {string} text - The text to type.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the typing action is complete.
     */
    type: async (elementid: string, text: string, options?: BrowserOperationOptions): Promise<BrowserActionResponseData> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.TYPE,
                text,
                elementid,
                instanceId
            },
            BrowserResponseType.TYPE_RESPONSE
        );
    },

    /**
     * Clicks on a specified element on the page.
     * @param {string} elementid - The ID of the element to click.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the click action is complete.
     */
    click: async (elementid: string, options?: BrowserOperationOptions): Promise<BrowserActionResponseData> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.CLICK,
                elementid,
                instanceId
            },
            BrowserResponseType.CLICK_RESPONSE
        );
    },

    /**
     * Simulates the Enter key press on the current page.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves when the Enter action is complete.
     */
    enter: async (options?: BrowserOperationOptions): Promise<BrowserActionResponseData> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.ENTER,
                instanceId
            },
            BrowserResponseType.ENTER_RESPONSE
        );
    },

    /**
     * Performs a search on the current page using a specified query.
     * @param {string} elementid - The ID of the element to perform the search in.
     * @param {string} query - The search query.
     * @param options - Optional browser operation options
     * @returns {Promise<BrowserActionResponseData>} A promise that resolves with the search results.
     */
    search: async (elementid: string, query: string, options?: BrowserOperationOptions): Promise<BrowserActionResponseData> => {
        const instanceId = await resolveInstanceId(options);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.BROWSER_EVENT,
                action: BrowserAction.SEARCH,
                elementid,
                query,
                instanceId
            },
            BrowserResponseType.SEARCH_RESPONSE
        );
    },

    // ================================
    // Browser Instance Management APIs
    // ================================

    /**
     * List all open browser instances
     * @returns {Promise<BrowserInstanceInfo[]>} Array of browser instance information
     */
    listBrowserInstances: async (): Promise<BrowserInstanceInfo[]> => {
        // For now, return a placeholder implementation
        // This will be implemented with proper backend communication
        if (activeInstanceId) {
            return [{
                instanceId: activeInstanceId,
                isActive: true,
                isReady: true,
                currentUrl: '',
                createdAt: new Date().toISOString(),
                title: ''
            }];
        }
        return [];
    },

    /**
     * Get a specific browser instance by ID
     * @param {string} instanceId - The instance ID to get
     * @returns {Promise<BrowserInstanceInfo | null>} Browser instance information or null if not found
     */
    getBrowserInstance: async (instanceId: string): Promise<BrowserInstanceInfo | null> => {
        const instances = await cbbrowser.listBrowserInstances();
        return instances.find(inst => inst.instanceId === instanceId) || null;
    },

    /**
     * Set the active browser instance
     * @param {string} instanceId - The instance ID to set as active
     * @returns {Promise<boolean>} True if successful, false if instance not found
     */
    setActiveBrowserInstance: async (instanceId: string): Promise<boolean> => {
        const instances = await cbbrowser.listBrowserInstances();
        const instance = instances.find(inst => inst.instanceId === instanceId);
        if (instance) {
            activeInstanceId = instanceId;
            return true;
        }
        return false;
    },

    /**
     * Open a new browser instance
     * @param options - Optional instance creation options
     * @returns {Promise<{ instanceId: string }>} The new instance ID
     */
    openNewBrowserInstance: async (options?: BrowserInstanceOptions): Promise<{ instanceId: string }> => {
        const newInstanceId = options?.instanceId || `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create the new page for this instance
        await cbbrowser.newPage({ instanceId: newInstanceId });
        
        // Set as active if requested (default true)
        if (options?.setActive !== false) {
            activeInstanceId = newInstanceId;
        }
        
        return { instanceId: newInstanceId };
    },

    /**
     * Close a browser instance
     * @param {string} instanceId - The instance ID to close
     * @returns {Promise<boolean>} True if successful, false if instance not found
     */
    closeBrowserInstance: async (instanceId: string): Promise<boolean> => {
        try {
            // Close the browser instance
            await cbbrowser.close({ instanceId });
            
            // Clear active instance if it was the one being closed
            if (activeInstanceId === instanceId) {
                activeInstanceId = null;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Execute action on specific browser instance
     * @param instanceId - The instance ID to execute on
     * @param operation - The operation to execute
     * @param params - Parameters for the operation
     * @returns The operation result
     */
    executeOnInstance: async (
        instanceId: string,
        operation: BrowserOperationType,
        params: BrowserOperationParams
    ): Promise<BrowserOperationResponse> => {
        // This will be implemented with proper backend communication
        // For now, use the existing browser functions with explicit instanceId
        const options = { instanceId, ...params };

        switch (operation) {
            case 'goToPage':
                return await cbbrowser.goToPage(params.url as string, options);
            case 'screenshot':
                return await cbbrowser.screenshot(options);
            case 'getContent':
                return await cbbrowser.getContent(options);
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    }
}

export default cbbrowser;



/***

start_browser(objective: string, url: string, previous_command: string, browser_content: string) {
    cbbrowser.newPage();
}
 */