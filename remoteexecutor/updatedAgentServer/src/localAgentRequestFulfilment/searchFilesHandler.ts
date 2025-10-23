import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface SearchFilesEvent {
  type: "fsEvent";
  action: "searchFiles";
  requestId: string;
  message: {
    path: string;
    regex: string;
    filePattern?: string;
  };
}

export class SearchFilesHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleSearchFiles(agent: ClientConnection, event: SearchFilesEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a search files event
    logger.info(
      formatLogMessage("info", "SearchFilesHandler", `Handling search files with regex: ${message.regex}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual file searching
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Search files operation not implemented`,
      error: `The search files operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}