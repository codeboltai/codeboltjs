import type { ClientConnection } from "../../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../../cloudLib/cloudMessaging/sendMessageToRemote.js";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { logger } from "../utils/logger";

/**
 * Base notification service with core functionality
 */
export class BaseNotificationService {
  protected connectionManager: ConnectionManager;
  protected sendMessageToRemote: SendMessageToRemote;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
  }

  /**
   * Notify all appropriate clients (app/tui) with the notification message
   */
  protected notifyClients(
    agent: ClientConnection,
    notification: any,
    targetClient?: TargetClient
  ): void {
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
    } else if (targetClient.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else {
      tuiManager.sendToTui(targetClient.id, notification);
    }
    
    logger.info("sending notification to ui", notification);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  /**
   * Static factory method for one-off usage
   */
  static getInstance(): BaseNotificationService {
    return new BaseNotificationService();
  }
}
