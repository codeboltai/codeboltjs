/**
 * Memory SDK Function Types
 * Types for the cbmemory module functions
 */

/**
 * Memory value types that can be stored
 */
export type MemoryValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

/**
 * Memory entry information
 */
export interface MemoryEntry {
  /** Memory key */
  key: string;
  /** Memory value */
  value: MemoryValue;
  /** Memory expiration time */
  expiresAt?: string;
  /** Memory creation timestamp */
  createdAt: string;
  /** Memory update timestamp */
  updatedAt: string;
  /** Memory metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult {
  /** Operation key */
  key: string;
  /** Operation success */
  success: boolean;
  /** Operation message */
  message?: string;
  /** Operation timestamp */
  timestamp: string;
  /** Operation metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Memory list result
 */
export interface MemoryListResult {
  /** Memory entries */
  entries: Record<string, MemoryEntry>;
  /** Memory keys */
  keys: string[];
  /** Total count */
  totalCount: number;
  /** List metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Memory search result
 */
export interface MemorySearchResult {
  /** Search query */
  query: string;
  /** Matching entries */
  matches: MemoryEntry[];
  /** Total matches found */
  totalMatches: number;
  /** Search metadata */
  metadata?: Record<string, unknown>;
}

// Base response interface for memory operations
export interface BaseMemorySDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
  /** Request identifier */
  requestId?: string;
  /** Response timestamp */
  timestamp?: string;
}

// Memory operation responses
export interface MemorySetResponse extends BaseMemorySDKResponse {
  key?: string;
  value?: MemoryValue;
  /** Operation result */
  result?: MemoryOperationResult;
  /** Set operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryGetResponse extends BaseMemorySDKResponse {
  key?: string;
  value?: MemoryValue;
  /** Memory entry data */
  entry?: MemoryEntry;
  /** Get operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryDeleteResponse extends BaseMemorySDKResponse {
  key?: string;
  /** Operation result */
  result?: MemoryOperationResult;
  /** Delete operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryListResponse extends BaseMemorySDKResponse {
  keys?: string[];
  entries?: Record<string, MemoryEntry>;
  /** List result data */
  result?: MemoryListResult;
  /** List operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryClearResponse extends BaseMemorySDKResponse {
  /** Operation result */
  result?: MemoryOperationResult;
  /** Clear operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemorySearchResponse extends BaseMemorySDKResponse {
  /** Search query */
  query?: string;
  /** Search results */
  results?: MemorySearchResult;
  /** Search operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryExistsResponse extends BaseMemorySDKResponse {
  key?: string;
  /** Whether the key exists */
  exists?: boolean;
  /** Exists check metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryExpireResponse extends BaseMemorySDKResponse {
  key?: string;
  /** Expiration time */
  expiresAt?: string;
  /** Operation result */
  result?: MemoryOperationResult;
  /** Expire operation metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryTTLResponse extends BaseMemorySDKResponse {
  key?: string;
  /** Time to live in seconds */
  ttl?: number;
  /** TTL check metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Memory operation parameters
 */
export interface MemorySetParams {
  /** Memory key */
  key: string;
  /** Memory value */
  value: MemoryValue;
  /** Expiration time in seconds */
  ttl?: number;
  /** Memory metadata */
  metadata?: Record<string, unknown>;
}

export interface MemoryGetParams {
  /** Memory key */
  key: string;
  /** Default value if key not found */
  defaultValue?: MemoryValue;
}

export interface MemoryDeleteParams {
  /** Memory key */
  key: string;
}

export interface MemoryListParams {
  /** Pattern to filter keys */
  pattern?: string;
  /** Maximum number of keys to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

export interface MemorySearchParams {
  /** Search query */
  query: string;
  /** Maximum number of results */
  limit?: number;
  /** Search metadata filters */
  filters?: Record<string, unknown>;
}

export interface MemoryExistsParams {
  /** Memory key */
  key: string;
}

export interface MemoryExpireParams {
  /** Memory key */
  key: string;
  /** Expiration time in seconds */
  ttl: number;
}

export interface MemoryTTLParams {
  /** Memory key */
  key: string;
}
