import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ReadManyFilesEvent {
  type: "fsEvent";
  action: "readManyFiles";
  requestId: string;
  message: {
    paths: string[];
  };
}

export class ReadManyFilesHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleReadManyFiles(agent: ClientConnection, event: ReadManyFilesEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a read many files event
    logger.info(
      formatLogMessage("info", "ReadManyFilesHandler", `Handling read many files for ${message.paths.length} paths`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual reading of multiple files
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Read many files operation not implemented`,
      error: `The read many files operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}