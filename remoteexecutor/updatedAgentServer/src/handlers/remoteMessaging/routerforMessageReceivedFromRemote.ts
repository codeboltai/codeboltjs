import { formatLogMessage, Message } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToTui } from '../tuiMessaging/sendMessageToTui';

/**
 * Routes inbound messages arriving from the remote proxy to local recipients.
 */
export class RemoteMessageRouter {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToTui = new SendMessageToTui();

  handleRemoteMessage(message: Message): void {
    console.log(formatLogMessage('info', 'RemoteMessageRouter', `Handling remote message of type ${message.type}`));

    const { target, agentId, clientId, tuiId } = message as Message & {
      target?: 'agent' | 'app' | 'tui';
      agentId?: string;
      clientId?: string;
      tuiId?: string;
    };

    switch (target) {
      case 'agent':
        this.forwardToAgent(agentId, message);
        break;
      case 'tui':
        this.forwardToTui(tuiId ?? clientId, message);
        break;
      case 'app':
      default:
        this.forwardToApp(clientId, message);
        break;
    }
  }

  private forwardToAgent(agentId: string | undefined, message: Message): void {
    const agentManager = this.connectionManager.getAgentConnectionManager();

    if (agentId) {
      agentManager
        .sendToSpecificAgent(agentId, 'remote-proxy', message)
        .catch((error) =>
          console.error(
            formatLogMessage('error', 'RemoteMessageRouter', `Failed to send remote message to agent ${agentId}: ${error}`)
          )
        );
      return;
    }

    agentManager.sendToAgent(message);
  }

  private forwardToApp(clientId: string | undefined, message: Message): void {
    const appManager = this.connectionManager.getAppConnectionManager();

    if (clientId) {
      const delivered = appManager.sendToApp(clientId, message);
      if (!delivered) {
        console.warn(
          formatLogMessage('warn', 'RemoteMessageRouter', `Remote message failed to reach local app ${clientId}`)
        );
      }
      return;
    }

    appManager.broadcast(message);
  }

  private forwardToTui(tuiId: string | undefined, message: Message): void {
    if (tuiId) {
      const delivered = this.sendMessageToTui.sendToTui(tuiId, message);
      if (!delivered) {
        console.warn(
          formatLogMessage('warn', 'RemoteMessageRouter', `Remote message failed to reach local TUI ${tuiId}`)
        );
      }
    } else {
      this.sendMessageToTui.broadcast(message);
    }
  }
}
