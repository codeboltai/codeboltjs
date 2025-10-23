import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface AttemptCompletionEvent {
  type: "taskEvent";
  action: "attemptCompletion";
  requestId: string;
  message: {
    result: string;
    success: boolean;
  };
}

export class AttemptCompletionHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleAttemptCompletion(agent: ClientConnection, event: AttemptCompletionEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received an attempt completion event
    logger.info(
      formatLogMessage("info", "AttemptCompletionHandler", `Handling attempt completion with success: ${message.success}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual task completion
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Attempt completion operation not implemented`,
      error: `The attempt completion operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}