/**
 * Tokenizer SDK Function Types
 * Types for the cbtokenizer module functions
 */

// Base response interface for tokenizer operations
export interface BaseTokenizerSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Tokenizer operation responses
export interface AddTokenResponse extends BaseTokenizerSDKResponse {
  token?: string;
  count?: number;
}

export interface GetTokenResponse extends BaseTokenizerSDKResponse {
  tokens?: string[];
  count?: number;
}
