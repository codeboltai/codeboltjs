// File Read API types

export interface FileAutocompleteParams {
  query?: string;
  path?: string;
  limit?: number;
}

export interface FileSearchParams {
  query?: string;
  path?: string;
  limit?: number;
}

export interface FileReadParams {
  path?: string;
  encoding?: string;
}

export interface FileAutocompleteResult {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface FileSearchResult {
  name: string;
  path: string;
  isDirectory: boolean;
  matchScore?: number;
}
