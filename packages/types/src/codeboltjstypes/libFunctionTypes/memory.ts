/**
 * Memory SDK Function Types
 * Types for the cbmemory module functions
 */

// Base response interface for memory operations
export interface BaseMemorySDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Memory operation responses
export interface MemorySetResponse extends BaseMemorySDKResponse {
  key?: string;
  value?: any;
}

export interface MemoryGetResponse extends BaseMemorySDKResponse {
  key?: string;
  value?: any;
}

export interface MemoryDeleteResponse extends BaseMemorySDKResponse {
  key?: string;
}

export interface MemoryListResponse extends BaseMemorySDKResponse {
  keys?: string[];
  entries?: Record<string, any>;
}

export interface MemoryClearResponse extends BaseMemorySDKResponse {}
