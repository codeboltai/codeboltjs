import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ListFilesEvent {
  type: "fsEvent";
  action: "listFiles";
  requestId: string;
  message: {
    path: string;
    recursive?: boolean;
  };
}

export class ListFilesHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleListFiles(agent: ClientConnection, event: ListFilesEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a list files event
    logger.info(
      formatLogMessage("info", "ListFilesHandler", `Handling list files for path: ${message.path}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual file listing
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `List files operation not implemented`,
      error: `The list files operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}