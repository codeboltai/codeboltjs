import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface BrowserActionEvent {
  type: "browserEvent";
  action: "browserAction";
  requestId: string;
  message: {
    action: string;
    url?: string;
    selector?: string;
    text?: string;
  };
}

export class BrowserActionHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleBrowserAction(agent: ClientConnection, event: BrowserActionEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a browser action event
    logger.info(
      formatLogMessage("info", "BrowserActionHandler", `Handling browser action: ${message.action}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual browser actions
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Browser action operation not implemented`,
      error: `The browser action operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}