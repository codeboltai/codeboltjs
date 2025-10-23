import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";

import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface TodoWriteEvent {
  type: "taskEvent";
  action: "todoWrite";
  requestId: string;
  message: {
    todos: Array<{
      title: string;
      status: string;
    }>;
  };
}

export class TodoWriteHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  async handleTodoWrite(agent: ClientConnection, event: TodoWriteEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a todo write event
    logger.info(
      formatLogMessage("info", "TodoWriteHandler", `Handling todo write for ${message.todos.length} todos`)
    );
    
    // For now, we'll send back a not implemented response
    // This can be extended to handle actual todo writing
    const response: GrepSearchErrorResponse = {
      type: "grepSearchResponse",
      requestId,
      success: false,
      message: `Todo write operation not implemented`,
      error: `The todo write operation is not yet implemented in this handler`,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendMessageToRemote.forwardAgentMessage(agent, response);
  }
}