import cbws from './websocket';

/**
 * Enum representing different types of log messages.
 */
export enum logType {
    /** Informational messages */
    info = "info",
    /** Error messages */
    error = "error",
    /** Warning messages */
    warning = "warning"
}

/**
 * Object with methods for summarizing chat history.
 * Provides functionality to create summaries of conversation history.
 */
export const chatSummary = {
    /**
     * Summarizes the entire chat history.
     * 
     * @returns Promise with an array of message objects containing role and content
     */
    summarizeAll: (): Promise<{
        role: string;
        content: string;
    }[]> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarizeAll",

            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeAllResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            })
        })


    },
    
    /**
     * Summarizes a specific part of the chat history.
     * 
     * @param messages - Array of message objects to summarize
     * @param depth - How far back in history to consider
     * @returns Promise with an array of summarized message objects
     */
    summarize: (messages: {
        role: string;
        content: string;
    }[], depth: number): Promise<{
        role: string;
        content: string;
    }[]> => {
        return new Promise((resolve, reject) => {
            cbws.getWebsocket.send(JSON.stringify({
                "type": "chatSummaryEvent",
                "action": "summarize",
                messages,
                depth
            }));
            cbws.getWebsocket.on('message', (data: string) => {
                const response = JSON.parse(data);
                if (response.type === "getSummarizeResponse") {
                    resolve(response.payload); // Resolve the Promise with the response data
                }
            })
        })

    }
}


export default chatSummary;



