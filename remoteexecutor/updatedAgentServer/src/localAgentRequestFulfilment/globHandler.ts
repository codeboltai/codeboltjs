import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface GlobEvent {
  type: "fsEvent";
  action: "glob";
  requestId: string;
  message: {
    pattern: string;
    path?: string;
  };
}

export class GlobHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleGlob(agent: ClientConnection, event: GlobEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a glob event
    logger.info(
      formatLogMessage("info", "GlobHandler", `Handling glob pattern: ${message.pattern}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual glob pattern matching
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Glob pattern matching not implemented`,
      error: `The glob pattern matching is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}