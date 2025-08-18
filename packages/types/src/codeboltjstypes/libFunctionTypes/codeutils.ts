/**
 * Code Utils SDK Function Types
 * Types for the cbcodeutils module functions
 */

// Base response interface for code utils operations
export interface BaseCodeUtilsSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Code analysis responses
export interface GetAllFilesMarkdownResponse extends BaseCodeUtilsSDKResponse {
  markdown?: string;
  files?: Array<{
    path: string;
    content: string;
    language?: string;
  }>;
}

export interface MatchProblemResponse extends BaseCodeUtilsSDKResponse {
  matches?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

export interface AnalyzeCodeResponse extends BaseCodeUtilsSDKResponse {
  analysis?: {
    complexity: number;
    maintainability: number;
    issues: Array<{
      type: string;
      severity: string;
      message: string;
      file: string;
      line: number;
    }>;
  };
}

export interface GetMatcherListTreeResponse extends BaseCodeUtilsSDKResponse {
  matchers?: Array<{
    name: string;
    description: string;
    language: string;
    pattern: string;
  }>;
}

export interface getMatchDetail extends BaseCodeUtilsSDKResponse {
  matcher?: {
    name: string;
    description: string;
    language: string;
    pattern: string;
    examples?: string[];
  };
}
