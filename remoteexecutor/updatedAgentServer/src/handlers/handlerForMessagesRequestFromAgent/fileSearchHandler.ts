import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from './../../types';
import type { FileSearchEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../appMessaging/sendMessageToApp.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager.js';
import { detectLanguage } from '../../utils/detectLanguage.js';

const execPromise = promisify(exec);

/**
 * Handles file search messages - implements functionality similar to fsService.fileSearch
 */
export class FileSearchHandler {
  private sendMessageToApp: SendMessageToApp;
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle file search request - implements fuzzy file search functionality
   */
  async handleFileSearch(agent: ClientConnection, fileSearchEvent: FileSearchEvent): Promise<void> {
    const { requestId, message } = fileSearchEvent;
    const { query } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling file search request for: ${query}`));

    try {
      // Validate query parameter
      if (!query || query.trim() === '') {
        const errorResponse = {
          success: false,
          error: 'Query parameter is required and cannot be empty',
          type: 'fileSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Use current working directory as search root
      const searchRoot = process.cwd();
      
      // Perform fuzzy file search
      const results = await this.fastFileFuzzySearch(searchRoot, query.trim());
      
      // Limit to 10 results as in original implementation
      const limitedResults = results.slice(0, 10);
      
      // Format results as string
      const formattedResults = limitedResults.length > 0
        ? limitedResults.join('\n')
        : "No matching files found.";
      
      const response = {
        success: true,
        data: formattedResults,
        results: limitedResults,
        type: 'fileSearchResponse',
        id: requestId,
        query: query
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Successfully found ${limitedResults.length} files for query: ${query}`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        success: false,
        error: `Failed to search files: ${errorMessage}`,
        type: 'fileSearchResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
      console.error(formatLogMessage('error', 'AgentMessageRouter', `Error searching files: ${errorMessage}`));
    }
  }

  /**
   * Performs a fast fuzzy search for files matching the given query
   * Based on fastFileFuzzySearch from fuzzyFileSearch.ts
   */
  private async fastFileFuzzySearch(rootDir: string, query: string): Promise<string[]> {
    try {
      console.log("Starting file search with rootDir:", rootDir, "query:", query);
      
      // Clean up the query to prepare for search
      const sanitizedQuery = query.replace(/[\\/:*?"<>|]/g, '');
      console.log("sanitizedQuery:", sanitizedQuery);
      
      // Try using find command with grep (most reliable)
      try {
        console.log("Trying direct file search...");
        // Search for the file directly using find and grep
        const findGrepCmd = `find "${rootDir}" -type f | grep -i "${sanitizedQuery}" | grep -v "node_modules" | head -10`;
        console.log("Running find+grep command:", findGrepCmd);
        
        const { stdout } = await execPromise(findGrepCmd);
        
        if (stdout && stdout.trim()) {
          const results = stdout.trim().split('\n').filter(line => line.trim()).map(file => {
            // Convert absolute paths to relative paths
            return file.startsWith(rootDir) 
              ? file.substring(rootDir.length + 1) 
              : file;
          });
          
          console.log("Find+grep results:", results);
          
          if (results.length > 0) {
            // Score and sort the results
            return this.scoreAndSortResults(results, sanitizedQuery);
          }
        } else {
          console.log("Find+grep command returned no results");
        }
      } catch (findGrepError) {
        console.error("Error using find+grep command:", findGrepError);
      }
      
      // Try searching for exact filename
      try {
        console.log("Trying exact filename search...");
        const exactCmd = `find "${rootDir}" -type f -name "*${sanitizedQuery}*" | grep -v "node_modules" | head -10`;
        console.log("Running exact search command:", exactCmd);
        
        const { stdout } = await execPromise(exactCmd);
        
        if (stdout && stdout.trim()) {
          const results = stdout.trim().split('\n').filter(line => line.trim()).map(file => {
            return file.startsWith(rootDir) 
              ? file.substring(rootDir.length + 1) 
              : file;
          });
          
          console.log("Exact search results:", results);
          
          if (results.length > 0) {
            return this.scoreAndSortResults(results, sanitizedQuery);
          }
        } else {
          console.log("Exact search command returned no results");
        }
      } catch (exactError) {
        console.error("Error using exact search command:", exactError);
      }
      
      // If all else fails, return empty results
      console.log("All search methods failed, returning empty results");
      return [];
    } catch (error) {
      console.error('Error during fuzzy file search:', error);
      return [];
    }
  }

  /**
   * Score and sort search results based on relevance to the query
   */
  private scoreAndSortResults(matches: string[], sanitizedQuery: string): string[] {
    // Score and sort results based on relevance to query
    const queryParts = sanitizedQuery.split(/(?=[A-Z])|\s+/).filter(part => part.length > 0);
    
    const scoredMatches = matches.map(match => {
      const fileName = path.basename(match);
      let score = 0;
      
      // Higher score if the entire query appears in the filename
      if (fileName.toLowerCase().includes(sanitizedQuery.toLowerCase())) {
        score += 15;
        
        // Even higher score if it's at the start of the filename
        if (fileName.toLowerCase().startsWith(sanitizedQuery.toLowerCase())) {
          score += 10;
        }
        
        // Perfect match gets highest score
        if (fileName.toLowerCase() === sanitizedQuery.toLowerCase()) {
          score += 20;
        }
      }
      
      // Score for camelCase matching (if we have multiple parts)
      if (queryParts.length > 1) {
        // Check if all parts are in the filename
        const lowerFileName = fileName.toLowerCase();
        const allPartsMatch = queryParts.every(part => 
          lowerFileName.includes(part.toLowerCase())
        );
        
        if (allPartsMatch) {
          score += 12;
        }
      }
      
      // Higher score for shorter paths (less depth)
      score -= match.split('/').length;
      
      // Higher score for files with the correct extension (if query includes extension)
      const queryExtension = path.extname(sanitizedQuery);
      if (queryExtension && path.extname(fileName) === queryExtension) {
        score += 5;
      }
      
      return { match, score, fileName };
    });
    
    // Sort by score (descending)
    scoredMatches.sort((a, b) => b.score - a.score);
    
    // Return the sorted file paths
    return scoredMatches.map(item => item.match);
  }
}
