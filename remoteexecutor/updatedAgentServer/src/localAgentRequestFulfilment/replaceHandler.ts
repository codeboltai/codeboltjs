import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ReplaceEvent {
  type: "fsEvent";
  action: "replace";
  requestId: string;
  message: {
    filePath: string;
    oldString: string;
    newString: string;
  };
}

export class ReplaceHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleReplace(agent: ClientConnection, event: ReplaceEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a replace event
    logger.info(
      formatLogMessage("info", "ReplaceHandler", `Handling replace for file: ${message.filePath}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual replace functionality
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Replace operation not implemented`,
      error: `The replace operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}