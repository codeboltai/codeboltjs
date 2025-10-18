import { ClientConnection, Message, formatLogMessage } from "../../types";
import { ConnectionManager } from "../../core/connectionManagers/connectionManager";
import { SendMessageToRemote } from "../remoteMessaging/sendMessageToRemote";
import { SendMessageToAgent } from "../agentMessaging/sendMessageToAgent";
import { BaseApplicationResponse, UserMessage } from "@codebolt/types/sdk";
import { logger } from "../../utils/logger";
import {
  ReadFileHandler,
  type ReadFileConfirmation,
} from "../../localAgentRequestFulfilment/readFileHandler.js";
import {
  WriteFileHandler,
  type WriteFileConfirmation,
} from "../../localAgentRequestFulfilment/writeFileHandler.js";

export class TuiMessageRouter {
  private connectionManager: ConnectionManager;
  private sendMessageToAgent: SendMessageToAgent;
  private sendMessageToRemote: SendMessageToRemote;
  private readFileHandler: ReadFileHandler;
  private writeFileHandler: WriteFileHandler;
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToAgent = new SendMessageToAgent();
    this.sendMessageToRemote = new SendMessageToRemote();
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
  }

  handleTuiMessage(tui: ClientConnection, message: any): void {
    logger.info(
      "TuiMessageRouter",
      `Processing TUI message: ${JSON.stringify(message)} from ${tui.id}`
    );
    logger.info(
      formatLogMessage(
        "info",
        "TuiMessageRouter",
        `Handling TUI message: ${message.type} from ${tui.id}`
      )
    );
    //check if its initial message
    if (!message.type) {
      return;
    }
    if (message.type === "confirmationResponse") {
      this.readFileHandler.handleConfirmation(message as ReadFileConfirmation);
      this.writeFileHandler.handleConfirmation(message as WriteFileConfirmation);
      return;
    }
    if (message.type === "messageResponse") {
      this.handleInitialUserMessage(tui, message as UserMessage);
    } else {
      this.sendMessageToAgent.sendResponseToAgent(
        tui,
        message as BaseApplicationResponse
      );
    }
    this.sendMessageToRemote.forwardAppMessage(
      tui.id,
      message as BaseApplicationResponse
    );
  }

  handleInitialUserMessage(tui: ClientConnection, message: UserMessage): void {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling initial user message: ${message.type} from ${tui.id}`
      )
    );
    this.sendMessageToAgent.sendInitialMessage(message,tui.id);
  }
}
