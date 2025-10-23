import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ShellCommandEvent {
  type: "shellEvent";
  action: "runShellCommand";
  requestId: string;
  message: {
    command: string;
    cwd?: string;
  };
}

export class ShellCommandHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleShellCommand(agent: ClientConnection, event: ShellCommandEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a shell command event
    logger.info(
      formatLogMessage("info", "ShellCommandHandler", `Handling shell command: ${message.command}`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual shell command execution
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Shell command execution not implemented`,
      error: `The shell command execution is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}