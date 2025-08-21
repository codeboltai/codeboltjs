import { GetSummarizeAllResponse, GetSummarizeResponse } from '@codebolt/types/sdk';
import { LogType } from '../types/commonTypes';
/**
 * Enum representing different types of log messages.
 * @deprecated Use LogType from commonTypes instead
 */
export declare enum logType {
    /** Informational messages */
    info = "info",
    /** Error messages */
    error = "error",
    /** Warning messages */
    warning = "warning"
}
export { LogType };
/**
 * Object with methods for summarizing chat history.
 * Provides functionality to create summaries of conversation history.
 */
export declare const chatSummary: {
    /**
     * Summarizes the entire chat history.
     *
     * @returns Promise with an array of message objects containing role and content
     */
    summarizeAll: () => Promise<GetSummarizeAllResponse>;
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
    }[], depth: number) => Promise<GetSummarizeResponse>;
};
export default chatSummary;
