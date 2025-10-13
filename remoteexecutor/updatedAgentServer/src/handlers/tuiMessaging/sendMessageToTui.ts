import { ClientConnection, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { logger } from '../../utils/logger';

export class SendMessageToTui {
  private readonly connectionManager = ConnectionManager.getInstance();

  sendToTui(tuiId: string, message: unknown): boolean {
    const tuiManager = this.connectionManager.getTuiConnectionManager();
    const delivered = tuiManager.sendToTui(tuiId, message);

    if (!delivered) {
      logger.warn(formatLogMessage('warn', 'SendMessageToTui', `Failed to send message to TUI ${tuiId}`));
    }

    return delivered;
  }

  broadcast(message: unknown): boolean {
    const tuiManager = this.connectionManager.getTuiConnectionManager();
    const tuis = tuiManager.getAllTuis();

    if (tuis.length === 0) {
      logger.warn(formatLogMessage('warn', 'SendMessageToTui', 'No TUI connections available for broadcast'));
      return false;
    }

    tuis.forEach((tui) => tuiManager.sendToTui(tui.id, message));
    return true;
  }
//
  sendResponseToTuis(agent: ClientConnection, message: Message): void {
    const payload = {
      ...message,
      agentId: (message as { agentId?: string }).agentId ?? agent.id
    };

    const targetClientId = (message as { clientId?: string }).clientId;

    if (targetClientId) {
      this.sendToTui(targetClientId, payload);
      return;
    }

    this.broadcast(payload);
  }
}
