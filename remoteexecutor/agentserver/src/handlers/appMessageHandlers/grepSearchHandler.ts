import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '@codebolt/types/remote';
import type { GrepSearchEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../sendMessageToApp.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ConnectionManager } from '../../core/connectionManager.js';

const execPromise = promisify(exec);

// Maximum number of search results to return
const MAX_RESULTS = 50;

interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  beforeContext: string[];
  afterContext: string[];
}

interface SearchResultOutput {
  files: string[];
  result: string;
}

/**
 * Handles grep search messages - implements functionality similar to fsService.grepSearch
 */
export class GrepSearchHandler {
  private sendMessageToApp: SendMessageToApp;
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle grep search request - implements regex search functionality using ripgrep
   */
  async handleGrepSearch(agent: ClientConnection, grepSearchEvent: GrepSearchEvent): Promise<void> {
    const { requestId, message } = grepSearchEvent;
    const { path: searchPath, query, includePattern, excludePattern, caseSensitive } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling grep search request in: ${searchPath} for: ${query}`));

    try {
      // Validate required parameters
      if (!searchPath) {
        const errorResponse = {
          success: false,
          error: 'Path parameter is required',
          type: 'grepSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      if (!query || query.trim() === '') {
        const errorResponse = {
          success: false,
          error: 'Query parameter is required and cannot be empty',
          type: 'grepSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Security check
      if (!isValidFilePath(searchPath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid search path. Only absolute paths without .. are allowed.',
          type: 'grepSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if directory exists
      if (!fs.existsSync(searchPath)) {
        const errorResponse = {
          success: false,
          error: `Directory does not exist: ${searchPath}`,
          type: 'grepSearchResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Perform the search using ripgrep-like functionality
      const searchResults = await this.regexSearchFiles(
        process.cwd(),
        searchPath,
        query.trim(),
        includePattern,
        excludePattern
      );
      
      const response = {
        success: true,
        data: searchResults.result,
        files: searchResults.files,
        type: 'grepSearchResponse',
        id: requestId,
        query: query,
        path: searchPath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Successfully found ${searchResults.files.length} files with matches for: ${query}`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        success: false,
        error: `Failed to perform grep search: ${errorMessage}`,
        type: 'grepSearchResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
      console.error(formatLogMessage('error', 'AgentMessageRouter', `Error performing grep search: ${errorMessage}`));
    }
  }

  /**
   * Perform regex search on files using grep fallback (since ripgrep might not be available)
   * Based on regexSearchFiles from ripgrep.ts
   */
  private async regexSearchFiles(
    cwd: string,
    directoryPath: string,
    regex: string,
    filePattern?: string,
    excludePattern?: string
  ): Promise<SearchResultOutput> {
    try {
      // Try using ripgrep if available, otherwise fall back to grep
      const hasRipgrep = await this.checkCommandExists('rg');
      
      if (hasRipgrep) {
        return await this.ripgrepSearch(cwd, directoryPath, regex, filePattern, excludePattern);
      } else {
        return await this.grepSearch(cwd, directoryPath, regex, filePattern, excludePattern);
      }
    } catch (error) {
      console.warn('Grep search failed, returning empty results:', error);
      return { files: [], result: "No results found" };
    }
  }

  /**
   * Check if a command exists in the system
   */
  private async checkCommandExists(command: string): Promise<boolean> {
    try {
      await execPromise(`which ${command}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Use ripgrep for search if available
   */
  private async ripgrepSearch(
    cwd: string,
    directoryPath: string,
    regex: string,
    filePattern?: string,
    excludePattern?: string
  ): Promise<SearchResultOutput> {
    const args = ["--json", "-e", regex, "--context", "1", directoryPath];
    
    // Add include pattern if provided
    if (filePattern && filePattern !== "*") {
      args.push("--glob", filePattern);
    }
    
    // Add exclude pattern if provided
    if (excludePattern) {
      args.push("--glob", `!${excludePattern}`);
    }

    try {
      const { stdout } = await execPromise(`rg ${args.map(arg => `"${arg}"`).join(' ')}`);
      return this.parseRipgrepOutput(stdout, cwd);
    } catch (error) {
      throw new Error(`Ripgrep search failed: ${error}`);
    }
  }

  /**
   * Use standard grep for search as fallback
   */
  private async grepSearch(
    cwd: string,
    directoryPath: string,
    regex: string,
    filePattern?: string,
    excludePattern?: string
  ): Promise<SearchResultOutput> {
    // Build grep command
    let grepCmd = `grep -r -n -H --context=1 "${regex}" "${directoryPath}"`;
    
    // Add file pattern filter if provided
    if (filePattern && filePattern !== "*") {
      grepCmd += ` --include="${filePattern}"`;
    }
    
    // Add exclude pattern if provided
    if (excludePattern) {
      grepCmd += ` --exclude="${excludePattern}"`;
    }
    
    // Exclude common directories
    grepCmd += ' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.codebolt';

    try {
      const { stdout } = await execPromise(grepCmd);
      return this.parseGrepOutput(stdout, cwd);
    } catch (error) {
      // Grep returns non-zero exit code when no matches found, which is normal
      if (error instanceof Error && error.message.includes('Command failed')) {
        return { files: [], result: "No results found" };
      }
      throw error;
    }
  }

  /**
   * Parse ripgrep JSON output
   */
  private parseRipgrepOutput(output: string, cwd: string): SearchResultOutput {
    const results: SearchResult[] = [];
    let currentResult: SearchResult | null = null;

    output.split("\n").forEach((line) => {
      if (line) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === "match") {
            if (currentResult) {
              results.push(currentResult);
            }
            currentResult = {
              file: parsed.data.path.text,
              line: parsed.data.line_number,
              column: parsed.data.submatches[0].start,
              match: parsed.data.lines.text,
              beforeContext: [],
              afterContext: [],
            };
          } else if (parsed.type === "context" && currentResult) {
            if (parsed.data.line_number < currentResult.line) {
              currentResult.beforeContext.push(parsed.data.lines.text);
            } else {
              currentResult.afterContext.push(parsed.data.lines.text);
            }
          }
        } catch (error) {
          console.error("Error parsing ripgrep output:", error);
        }
      }
    });

    if (currentResult) {
      results.push(currentResult);
    }

    return this.formatResults(results, cwd);
  }

  /**
   * Parse standard grep output
   */
  private parseGrepOutput(output: string, cwd: string): SearchResultOutput {
    const results: SearchResult[] = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse grep output format: file:line:content or file-line-content (for context)
      const colonMatch = line.match(/^([^:]+):(\d+):(.*)$/);
      const dashMatch = line.match(/^([^-]+)-(\d+)-(.*)$/);
      
      if (colonMatch) {
        // This is a match line
        const [, file, lineNum, content] = colonMatch;
        results.push({
          file: file,
          line: parseInt(lineNum),
          column: 0,
          match: content,
          beforeContext: [],
          afterContext: []
        });
      }
      // Note: For simplicity, we're not handling context lines in basic grep parsing
      // The ripgrep version handles this better
    }

    return this.formatResults(results, cwd);
  }

  /**
   * Format search results into a readable string format
   */
  private formatResults(results: SearchResult[], cwd: string): SearchResultOutput {
    const files: string[] = [];
    let formattedResult = "";

    if (results.length === 0) {
      return { files: [], result: "No results found" };
    }

    // Group results by file
    const fileGroups = new Map<string, SearchResult[]>();
    for (const result of results) {
      if (!fileGroups.has(result.file)) {
        fileGroups.set(result.file, []);
      }
      fileGroups.get(result.file)!.push(result);
    }

    // Format each file's results
    for (const [file, fileResults] of fileGroups) {
      const relativePath = path.relative(cwd, file);
      files.push(relativePath);
      
      formattedResult += `\n${relativePath}\n`;
      formattedResult += "│----\n";
      
      for (const result of fileResults) {
        // Add before context
        for (const beforeLine of result.beforeContext) {
          formattedResult += `│${beforeLine}\n`;
        }
        
        // Add the match line with highlighting
        formattedResult += `│${result.match}\n`;
        
        // Add after context
        for (const afterLine of result.afterContext) {
          formattedResult += `│${afterLine}\n`;
        }
        
        if (fileResults.length > 1) {
          formattedResult += "│----\n";
        }
      }
      
      formattedResult += "│----\n";
    }

    return {
      files: Array.from(new Set(files)), // Remove duplicates
      result: formattedResult.trim()
    };
  }
}
