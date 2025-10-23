import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface GitActionEvent {
  type: "gitEvent";
  action: "gitAction";
  requestId: string;
  message: {
    command: string;
    args?: string[];
  };
}

export class GitActionHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleGitAction(agent: ClientConnection, event: GitActionEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a git action event
    logger.info(
      formatLogMessage("info", "GitActionHandler", `Handling git action: ${message.command}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual git actions
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Git action operation not implemented`,
      error: `The git action operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}