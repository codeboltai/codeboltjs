/**
 * Interface for database memory notification functions
 */
export interface DbmemoryNotifications {
    AddMemoryRequestNotify(key: string, value: any, toolUseId?: string): void;
    AddMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetMemoryRequestNotify(key: string, toolUseId?: string): void;
    GetMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}
