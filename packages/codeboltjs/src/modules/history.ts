import cbws from '../core/websocket';
import { GetSummarizeAllResponse, GetSummarizeResponse } from '../types/socketMessageTypes';
import { LogType } from '../types/commonTypes';

/**
 * Enum representing different types of log messages.
 * @deprecated Use LogType from commonTypes instead
 */
export enum logType {
    /** Informational messages */
    info = "info",
    /** Error messages */
    error = "error",
    /** Warning messages */
    warning = "warning"
}

// Re-export the new LogType for consistency
export { LogType };

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
    summarizeAll: (): Promise<GetSummarizeAllResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "chatSummaryEvent",
                "action": "summarizeAll",
            },
            "getSummarizeAllResponse"
        );
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
    }[], depth: number): Promise<GetSummarizeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": "chatSummaryEvent",
                "action": "summarize",
                messages,
                depth
            },
            "getSummarizeResponse"
        );
    }
}


export default chatSummary;



