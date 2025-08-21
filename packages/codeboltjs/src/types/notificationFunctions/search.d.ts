/**
 * Interface for search notification functions
 */
export interface SearchNotifications {
    SearchInitRequestNotify(engine?: string, toolUseId?: string): void;
    SearchInitResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    SearchRequestNotify(query: string, toolUseId?: string): void;
    SearchResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetFirstLinkRequestNotify(query: string, toolUseId?: string): void;
    GetFirstLinkResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}
