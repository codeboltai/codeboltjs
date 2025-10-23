import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ExecuteCommandEvent {
  type: "shellEvent";
  action: "executeCommand";
  requestId: string;
  message: {
    command: string;
  };
}

export class ExecuteCommandHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleExecuteCommand(agent: ClientConnection, event: ExecuteCommandEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received an execute command event
    logger.info(
      formatLogMessage("info", "ExecuteCommandHandler", `Handling execute command: ${message.command}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual command execution
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Execute command operation not implemented`,
      error: `The execute command operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}