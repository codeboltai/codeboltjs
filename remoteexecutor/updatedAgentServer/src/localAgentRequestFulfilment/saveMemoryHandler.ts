import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface SaveMemoryEvent {
  type: "memoryEvent";
  action: "saveMemory";
  requestId: string;
  message: {
    key: string;
    value: string;
  };
}

export class SaveMemoryHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleSaveMemory(agent: ClientConnection, event: SaveMemoryEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a save memory event
    logger.info(
      formatLogMessage("info", "SaveMemoryHandler", `Handling save memory for key: ${message.key}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual memory saving
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Save memory operation not implemented`,
      error: `The save memory operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}