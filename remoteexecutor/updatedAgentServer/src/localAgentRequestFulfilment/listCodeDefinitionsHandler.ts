import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ListCodeDefinitionsEvent {
  type: "fsEvent";
  action: "listCodeDefinitionNames";
  requestId: string;
  message: {
    path: string;
  };
}

export class ListCodeDefinitionsHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleListCodeDefinitions(agent: ClientConnection, event: ListCodeDefinitionsEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a list code definitions event
    logger.info(
      formatLogMessage("info", "ListCodeDefinitionsHandler", `Handling list code definitions for path: ${message.path}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual code definition listing
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `List code definitions operation not implemented`,
      error: `The list code definitions operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}