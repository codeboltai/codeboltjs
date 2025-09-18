import fs from 'fs';
import path from 'path';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '@codebolt/shared-types';
import { SendMessageToApp } from '../sendMessageToApp.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ConnectionManager } from '../../core/connectionManager.js';
import { detectLanguage } from '../../utils/detectLanguage.js';

// Interface for codebase search event (since it may not be defined in shared types)
interface CodebaseSearchEvent {
  requestId: string;
  message: {
    query: string;
    target_directories?: string[];
  };
}

// Interface for search results
interface SearchResult {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  score: number;
  codeSnippet?: string;
  language?: string;
  error?: string;
}

/**
 * Handles codebase search messages - implements semantic code search functionality
 * Based on codebaseSearch.cli.ts from the main CodeBolt project
 */
export class CodebaseSearchHandler {
  private sendMessageToApp: SendMessageToApp;
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle codebase search request - implements semantic search functionality
   */
  async handleCodebaseSearch(agent: ClientConnection, codebaseSearchEvent: CodebaseSearchEvent): Promise<void> {
    const { requestId, message } = codebaseSearchEvent;
    const { query, target_directories } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling codebase search request for: ${query}`));

    try {
      // Validate query parameter
      if (!query || query.trim() === '') {
        const errorResponse = {
          success: false,
          error: 'Query parameter is required and cannot be empty',
          type: 'codebaseSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Validate target directories if provided
      if (target_directories && target_directories.length > 0) {
        for (const dir of target_directories) {
          if (!isValidFilePath(dir)) {
            const errorResponse = {
              success: false,
              error: `Invalid target directory: ${dir}. Only absolute paths without .. are allowed.`,
              type: 'codebaseSearchResponse',
              id: requestId
            };
            
            this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
            return;
          }
        }
      }

      // Perform semantic code search
      const searchResults = await this.performCodebaseSearch(query.trim(), target_directories);
      
      const response = {
        success: true,
        data: searchResults,
        results: searchResults.results,
        type: 'codebaseSearchResponse',
        id: requestId,
        query: query
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Successfully found ${searchResults.results?.length || 0} code snippets for: ${query}`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        success: false,
        error: `Failed to search codebase: ${errorMessage}`,
        type: 'codebaseSearchResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
      console.error(formatLogMessage('error', 'AgentMessageRouter', `Error searching codebase: ${errorMessage}`));
    }
  }

  /**
   * Perform semantic codebase search
   * This is a simplified implementation since we don't have access to the vector database
   */
  private async performCodebaseSearch(query: string, targetDirectories?: string[]): Promise<{
    success: boolean;
    results: SearchResult[];
  }> {
    try {
      // Use current working directory as the base search path
      const basePath = process.cwd();
      const searchPaths = targetDirectories && targetDirectories.length > 0 
        ? targetDirectories 
        : [basePath];

      const allResults: SearchResult[] = [];

      // Search in each target directory
      for (const searchPath of searchPaths) {
        const results = await this.searchInDirectory(searchPath, query);
        allResults.push(...results);
      }

      // Sort results by relevance score (descending)
      allResults.sort((a, b) => b.score - a.score);

      // Limit results to 10 (as in original implementation)
      const limitedResults = allResults.slice(0, 10);

      // Process each result to include code snippets
      const resultsWithCode = await Promise.all(limitedResults.map(async (result) => {
        try {
          // Read the file content
          if (!fs.existsSync(result.filePath)) {
            return {
              ...result,
              codeSnippet: `[File not found: ${result.filePath}]`,
              error: "File not found"
            };
          }

          const fileContent = fs.readFileSync(result.filePath, 'utf-8');
          const fileLines = fileContent.split('\n');

          // Extract the relevant lines based on lineStart and lineEnd
          const startLine = Math.max(0, result.lineStart - 1); // Convert to 0-indexed
          const endLine = Math.min(fileLines.length, result.lineEnd);
          const relevantLines = fileLines.slice(startLine, endLine);

          // Join the lines to create the code snippet
          const codeSnippet = relevantLines.join('\n');

          return {
            ...result,
            codeSnippet,
            language: detectLanguage(result.filePath)
          };
        } catch (error) {
          return {
            ...result,
            codeSnippet: `[Error reading file: ${error instanceof Error ? error.message : String(error)}]`,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }));

      return {
        success: true,
        results: resultsWithCode
      };

    } catch (error) {
      throw new Error(`Error performing codebase search: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search for relevant code in a directory using text-based matching
   * This is a simplified fallback since we don't have vector search
   */
  private async searchInDirectory(directoryPath: string, query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    if (queryTerms.length === 0) {
      return results;
    }

    try {
      const files = await this.getCodeFiles(directoryPath);
      
      for (const filePath of files.slice(0, 50)) { // Limit files to search
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          
          // Search for query terms in file content
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            let score = 0;
            let matchCount = 0;
            
            // Score based on how many query terms appear in the line
            for (const term of queryTerms) {
              if (line.includes(term)) {
                matchCount++;
                score += term.length; // Longer terms get higher score
              }
            }
            
            // If we have matches, create a result
            if (matchCount > 0) {
              // Calculate context window (5 lines before and after)
              const lineStart = Math.max(1, i - 2);
              const lineEnd = Math.min(lines.length, i + 3);
              
              // Boost score for multiple matches and complete matches
              score = score * matchCount * (matchCount / queryTerms.length);
              
              results.push({
                filePath: filePath,
                lineStart: lineStart,
                lineEnd: lineEnd,
                score: score
              });
            }
          }
        } catch (error) {
          console.warn(`Error reading file ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Error searching directory ${directoryPath}:`, error);
    }

    return results;
  }

  /**
   * Get all code files in a directory recursively
   */
  private async getCodeFiles(dirPath: string, maxFiles: number = 100): Promise<string[]> {
    const files: string[] = [];
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.rs', '.go', 
      '.c', '.h', '.cpp', '.hpp', '.cs', '.rb', '.java', 
      '.php', '.swift', '.kt', '.scala', '.clj', '.hs',
      '.ml', '.elm', '.vue', '.svelte'
    ];

    const traverseDirectory = (currentPath: string, level: number = 0) => {
      if (level > 5 || files.length >= maxFiles) return; // Limit depth and file count
      
      try {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
          if (files.length >= maxFiles) break;
          
          // Skip hidden files and common ignore directories
          if (item.startsWith('.') || [
            'node_modules', 'dist', 'build', 'target', '__pycache__',
            'vendor', 'deps', 'tmp', 'temp', '.git', '.codebolt'
          ].includes(item)) continue;
          
          const itemPath = path.join(currentPath, item);
          
          try {
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              traverseDirectory(itemPath, level + 1);
            } else if (stats.isFile()) {
              const ext = path.extname(item).toLowerCase();
              if (codeExtensions.includes(ext)) {
                files.push(itemPath);
              }
            }
          } catch (error) {
            console.warn(`Error stating ${itemPath}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Error reading directory ${currentPath}:`, error);
      }
    };
    
    traverseDirectory(dirPath);
    return files;
  }


}
