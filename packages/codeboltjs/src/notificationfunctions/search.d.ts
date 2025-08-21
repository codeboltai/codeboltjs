/**
 * Search Notification Functions
 *
 * This module provides functions for sending search-related notifications,
 * including search initialization and query operations.
 */
import { SearchNotifications } from '../types/notificationFunctions/search';
/**
 * Sends a search init request notification
 * @param engine - Optional search engine to initialize
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function SearchInitRequestNotify(engine?: string, toolUseId?: string): void;
/**
 * Sends a search init result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function SearchInitResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a search request notification
 * @param query - The search query string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function SearchRequestNotify(query: string, toolUseId?: string): void;
/**
 * Sends a search result notification
 * @param content - The search result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function SearchResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a get first link request notification
 * @param query - The search query to get the first link for
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GetFirstLinkRequestNotify(query: string, toolUseId?: string): void;
/**
 * Sends a get first link result notification
 * @param content - The first link result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GetFirstLinkResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Search notification functions object
 */
export declare const searchNotifications: SearchNotifications;
