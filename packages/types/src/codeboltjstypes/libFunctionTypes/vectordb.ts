/**
 * Vector Database SDK Function Types
 * Types for the cbvectordb module functions
 */

// Base response interface for vector database operations
export interface BaseVectorDBSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Vector database operation responses
export interface AddVectorItemResponse extends BaseVectorDBSDKResponse {
  item?: any; // VectorItem from commonTypes
}

export interface GetVectorResponse extends BaseVectorDBSDKResponse {
  vector?: number[];
  item?: any; // VectorItem from commonTypes
}

export interface QueryVectorItemResponse extends BaseVectorDBSDKResponse {
  item?: any; // VectorItem from commonTypes
  results?: any; // VectorQueryResult from commonTypes
}

export interface QueryVectorItemsResponse extends BaseVectorDBSDKResponse {
  items?: any[]; // VectorItem[] from commonTypes
  results?: any; // VectorQueryResult from commonTypes
}
