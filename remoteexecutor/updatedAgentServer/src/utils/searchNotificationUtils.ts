/**
 * Utility functions for formatting search notification data
 */

export interface FormattedListDirectoryEntry {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  modified?: string;
}

export interface FormattedCodebaseSearchResult {
  file: string;
  content: string;
  line?: number;
  score?: number;
}

export interface FormattedGrepSearchResult {
  file: string;
  line: number;
  content: string;
}

/**
 * Format raw glob results to list directory entries
 * 
 * Expected input format from GlobTool:
 * {
 *   results?: Array<{
 *     path: string;
 *   }>;
 *   totalFiles?: number;
 * }
 */
export function formatGlobResults(results: any): { 
  entries: FormattedListDirectoryEntry[]; 
  totalEntries: number 
} {
  const globResults = results.results || [];
  const totalFiles = results.totalFiles || globResults.length;
  
  const entries = globResults.map((item: any) => ({
    name: item.path?.split('/').pop() || 'unknown',
    type: 'file' as 'file', // Glob only returns files
    path: item.path || 'unknown',
    size: undefined, // Glob doesn't provide size info
    modified: undefined // Glob doesn't provide modification time
  }));
  
  return {
    entries,
    totalEntries: totalFiles
  };
}

/**
 * Format raw list files results to list directory entries
 * 
 * Expected input format from ListFilesTool:
 * Array of file paths as strings
 */
export function formatListFilesResults(results: any): { 
  entries: FormattedListDirectoryEntry[]; 
  totalEntries: number 
} {
  // The ListFilesTool returns an array of file paths as strings
  const filePaths = Array.isArray(results) ? results : [];
  
  const entries = filePaths.map((filePath: string) => {
    // Determine if it's a directory by checking if it ends with a slash or has an extension
    const isDirectory = filePath.endsWith('/') || !filePath.includes('.');
    
    return {
      name: filePath.split('/').pop() || 'unknown',
      type: isDirectory ? 'directory' as 'directory' : 'file' as 'file',
      path: filePath,
      size: undefined, // ListFiles doesn't provide size info
      modified: undefined // ListFiles doesn't provide modification time
    };
  });
  
  return {
    entries,
    totalEntries: filePaths.length
  };
}

/**
 * Format raw list directory results to list directory entries
 * 
 * Expected input format from ListDirectoryTool:
 * {
 *   entries?: Array<{
 *     name: string;
 *     path: string;
 *     relativePath?: string;
 *     isDirectory: boolean;
 *     size: number;
 *     modifiedTime: Date;
 *   }>;
 * }
 */
export function formatListDirectoryResults(results: any): { 
  entries: FormattedListDirectoryEntry[]; 
  totalEntries: number 
} {
  const rawEntries = results.entries || [];
  
  const entries = rawEntries.map((entry: any) => ({
    name: entry.name || 'unknown',
    type: entry.isDirectory ? 'directory' : 'file',
    path: entry.path || 'unknown',
    size: entry.size,
    modified: entry.modifiedTime ? entry.modifiedTime.toISOString() : undefined
  }));
  
  return {
    entries,
    totalEntries: rawEntries.length
  };
}

/**
 * Format raw file search results to grep search results
 * 
 * Expected input format from GrepTool:
 * {
 *   results?: Array<{
 *     path: string;
 *     file?: string;
 *     line?: number;
 *     content?: string;
 *     lineNumber?: number;
 *     lineText?: string;
 *   }>;
 *   totalMatches?: number;
 *   filesWithMatches?: number;
 * }
 */
export function formatFileSearchResults(results: any): { 
  formattedResults: FormattedGrepSearchResult[]; 
  totalMatches: number; 
  filesWithMatches: number 
} {
  const grepResults = results.results || [];
  const totalMatches = results.totalMatches || grepResults.length;
  const filesWithMatches = results.filesWithMatches || 
    new Set(grepResults.map((r: any) => r.path || r.file)).size;
  
  const finalResults = grepResults.map((item: any) => ({
    file: item.path || item.file || 'unknown',
    line: item.line || item.lineNumber || 0,
    content: item.content || item.lineText || ''
  }));
  
  return {
    formattedResults: finalResults,
    totalMatches,
    filesWithMatches
  };
}

/**
 * Format raw search files results to codebase search results
 * 
 * Expected input format from SearchFilesTool:
 * {
 *   matches?: Array<{
 *     filePath: string;
 *     lineNumber: number;
 *     line: string;
 *   }>;
 * }
 */
export function formatSearchFilesResults(results: any): {
  results: FormattedCodebaseSearchResult[];
  totalResults: number;
} {
  const matches = results.matches || [];
  
  const formattedResults = matches.map((match: any) => ({
    file: match.filePath || 'unknown',
    content: match.line || '',
    line: match.lineNumber || 0,
    score: 1.0 // Default score since SearchFiles doesn't provide one
  }));
  
  return {
    results: formattedResults,
    totalResults: formattedResults.length
  };
}