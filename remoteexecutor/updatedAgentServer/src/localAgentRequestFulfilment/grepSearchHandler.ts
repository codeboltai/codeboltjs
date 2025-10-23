import { v4 as uuidv4 } from "uuid";
import * as path from "node:path";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import { DefaultWorkspaceContext } from "../fsutils/DefaultWorkspaceContext";
import { createSearchFileContent } from "../fsutils/SearchFileContent";

import type { GrepSearchEvent } from "@codebolt/types/agent-to-app-ws-types";
import type {
  GrepSearchSuccessResponse,
  GrepSearchErrorResponse,
} from "@codebolt/types/app-to-agent-ws-types";

type SearchExecutionResult = {
  success: true;
  matches: Array<{ filePath: string; lineNumber: number; line: string }>;
} | {
  success: false;
  error: string;
};

export class GrepSearchHandler {
  private static readonly workspaceContext = new DefaultWorkspaceContext();
  private static readonly searchFileContentService = createSearchFileContent({
    workspaceContext: GrepSearchHandler.workspaceContext,
  });

  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleGrepSearch(agent: ClientConnection, event: GrepSearchEvent): Promise<void> {
    const { requestId, message } = event;
    
    const result = await this.executeSearch(agent, event);
    await this.dispatchSearchOutcome(agent, requestId, message, result);
  }

  private async dispatchSearchOutcome(
    agent: ClientConnection,
    requestId: string,
    payload: GrepSearchEvent["message"],
    result: SearchExecutionResult
  ): Promise<void> {
    if (!result.success) {
      this.sendFailure(agent, requestId, payload, result.error);
      return;
    }

    const successBody: GrepSearchSuccessResponse = {
      type: "grepSearchResponse",
      requestId,
      success: true,
      message: `Found ${result.matches.length} match${result.matches.length === 1 ? "" : "es"}`,
      results: result.matches,
      data: {
        query: payload.query,
        path: payload.path,
      },
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...successBody,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, successBody);
  }

  private sendFailure(
    agent: ClientConnection,
    requestId: string,
    payload: GrepSearchEvent["message"],
    error: string
  ): void {
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: error,
      error,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }

  private async executeSearch(agent: ClientConnection, event: GrepSearchEvent): Promise<SearchExecutionResult> {
    const { message } = event;
    const rawPath = message.path?.trim();
    const searchPath = rawPath && rawPath.length > 0 ? rawPath : process.cwd();

    try {
      const searchResult = await GrepSearchHandler.searchFileContentService.searchFileContent({
        pattern: message.query,
        path: searchPath,
        include: message.includePattern,
      });

      if (!searchResult.success) {
        return {
          success: false,
          error: searchResult.error ?? "Search failed",
        };
      }

      let matches = searchResult.matches?.map(match => ({
        filePath: match.filePath,
        lineNumber: match.lineNumber,
        line: match.line
      })) ?? [];

      if (message.excludePattern) {
        const excludes = this.normalizePatterns(message.excludePattern);
        matches = matches.filter((match) => !excludes.some((pattern) => this.matchesPattern(match.filePath, pattern)));
      }

      if (message.caseSensitive) {
        const caseRegExp = this.safeCreateRegExp(message.query, true);
        if (caseRegExp) {
          matches = matches.filter((match) => caseRegExp.test(match.line));
        }
      }

      return {
        success: true,
        matches,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        formatLogMessage("error", "GrepSearchHandler", `Search execution error: ${errorMessage}`)
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private normalizePatterns(pattern: string): string[] {
    return pattern
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  private matchesPattern(value: string, pattern: string): boolean {
    const escaped = pattern
      .replace(/([.+^${}()|[\]\\])/g, "\\$1")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${escaped}$`);
    return regex.test(value.replace(/\\/g, "/"));
  }

  private safeCreateRegExp(pattern: string, caseSensitive: boolean): RegExp | null {
    try {
      return new RegExp(pattern, caseSensitive ? undefined : "i");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`GrepSearchHandler: invalid regular expression "${pattern}": ${errorMessage}`);
      return null;
    }
  }
}