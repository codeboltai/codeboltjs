import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ExplainNextActionEvent {
  type: "taskEvent";
  action: "explainNextAction";
  requestId: string;
  message: {
    context: string;
  };
}

export class ExplainNextActionHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleExplainNextAction(agent: ClientConnection, event: ExplainNextActionEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received an explain next action event
    logger.info(
      formatLogMessage("info", "ExplainNextActionHandler", `Handling explain next action`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual explanation
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Explain next action operation not implemented`,
      error: `The explain next action operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}