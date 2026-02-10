import cbws from '../core/websocket';

// ---------------------------------------------------------------------------
// Types for DynamicPanel operations
// ---------------------------------------------------------------------------

export interface DynamicPanelOpenOptions {
    /** If true, the open() call blocks until the panel sends a { type: 'submit' } message */
    waitForResponse?: boolean;
    /** Timeout in milliseconds for waitForResponse mode (default: 300000 = 5 min) */
    timeout?: number;
}

export interface DynamicPanelOpenResponse {
    type: string;
    success: boolean;
    data?: {
        success: boolean;
        panelId: string;
        data?: any;
    };
    error?: string;
    requestId?: string;
}

export interface DynamicPanelResponse {
    type: string;
    success: boolean;
    data?: any;
    error?: string;
    requestId?: string;
}

export interface DynamicPanelInfo {
    panelId: string;
    title: string;
    html: string;
    pluginId?: string;
    createdAt: string;
}

export interface DynamicPanelListResponse {
    type: string;
    success: boolean;
    data?: {
        panels: DynamicPanelInfo[];
    };
    error?: string;
    requestId?: string;
}

export interface DynamicPanelMessageEvent {
    type: 'dynamicPanel.message';
    panelId: string;
    data: any;
    messageId?: string;
    threadId?: string;
}

// ---------------------------------------------------------------------------
// Message handler tracking
// ---------------------------------------------------------------------------

const panelMessageHandlers: Map<string, (data: any) => void> = new Map();
let messageRouteCleanup: (() => void) | null = null;

/**
 * Ensures the global message route for dynamicPanel.message is registered.
 * Incoming messages are dispatched to per-panel handlers.
 */
function ensureMessageRoute(): void {
    if (messageRouteCleanup) return;

    messageRouteCleanup = cbws.messageManager.registerRoute({
        messageTypes: ['dynamicPanel.message'],
        handler: (message: DynamicPanelMessageEvent) => {
            const handler = panelMessageHandlers.get(message.panelId);
            if (handler) {
                handler(message.data);
            }
        },
    });
}

// ---------------------------------------------------------------------------
// DynamicPanel SDK module
// ---------------------------------------------------------------------------

const cbdynamicPanel = {
    /**
     * Opens a new DynamicPanel with the given HTML content.
     *
     * When `opts.waitForResponse` is true the call **blocks** until the panel
     * iframe sends a `{ type: 'submit', data: {...} }` message via
     * `window.parent.postMessage()`.  The resolved value then contains the
     * submitted data.
     *
     * @param panelId  Unique identifier for the panel
     * @param title    Human-readable panel title shown in the tab
     * @param html     Full HTML document rendered inside the panel iframe
     * @param opts     Optional: `waitForResponse`, `timeout`
     */
    open: async (
        panelId: string,
        title: string,
        html: string,
        opts?: DynamicPanelOpenOptions,
    ): Promise<DynamicPanelOpenResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'dynamicPanel.open',
                params: { panelId, title, html, ...opts },
            },
            'dynamicPanelOpenResponse',
            opts?.waitForResponse ? (opts.timeout || 300000) : 0,
        );
    },

    /**
     * Replaces the HTML content of an existing DynamicPanel.
     *
     * @param panelId  The panel to update
     * @param html     New HTML content
     */
    update: async (panelId: string, html: string): Promise<DynamicPanelResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'dynamicPanel.update',
                params: { panelId, html },
            },
            'dynamicPanelUpdateResponse',
        );
    },

    /**
     * Closes a DynamicPanel and removes it from the UI.
     *
     * @param panelId  The panel to close
     */
    close: async (panelId: string): Promise<DynamicPanelResponse> => {
        // Unregister any local message handler for this panel
        panelMessageHandlers.delete(panelId);
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'dynamicPanel.close',
                params: { panelId },
            },
            'dynamicPanelCloseResponse',
        );
    },

    /**
     * Pushes arbitrary data into the panel's iframe via `postMessage`.
     * The iframe receives this in its `window.addEventListener('message', ...)` handler.
     *
     * @param panelId  The target panel
     * @param data     Any JSON-serializable payload
     */
    send: async (panelId: string, data: any): Promise<DynamicPanelResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'dynamicPanel.send',
                params: { panelId, data },
            },
            'dynamicPanelSendResponse',
        );
    },

    /**
     * Lists all currently active DynamicPanels.
     */
    list: async (): Promise<DynamicPanelListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'dynamicPanel.list',
                params: {},
            },
            'dynamicPanelListResponse',
        );
    },

    /**
     * Registers a handler for messages coming **from** a specific panel's iframe.
     * The iframe sends messages via `window.parent.postMessage({ type: '...', data: {...} }, '*')`.
     *
     * Only one handler per panelId is supported.  Calling this again for the
     * same panelId replaces the previous handler.
     *
     * @param panelId  The panel to listen to
     * @param handler  Callback receiving the message data
     */
    onMessage: (panelId: string, handler: (data: any) => void): void => {
        ensureMessageRoute();
        panelMessageHandlers.set(panelId, handler);
    },

    /**
     * Removes the message handler for a specific panel.
     *
     * @param panelId  The panel to stop listening to
     */
    offMessage: (panelId: string): void => {
        panelMessageHandlers.delete(panelId);
    },
};

export default cbdynamicPanel;
