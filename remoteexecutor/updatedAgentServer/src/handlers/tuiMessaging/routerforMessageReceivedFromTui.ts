import { ClientConnection, Message, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { WranglerProxyClient } from '../../core/remote/wranglerProxyClient';

export class TuiMessageRouter {
  private readonly connectionManager = ConnectionManager.getInstance();

  handleTuiMessage(tui: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'TuiMessageRouter', `Handling TUI message: ${message.type} from ${tui.id}`));

    this.forwardToAgent(tui, message);
  }

  private forwardToAgent(tui: ClientConnection, message: Message): void {
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const remoteClient = WranglerProxyClient.getInstance();

    const messageWithClientId = {
      ...message,
      clientId: (message as { clientId?: string }).clientId ?? tui.id
    };

    const success = agentManager.sendToAgent(messageWithClientId);

    if (!success) {
      if (remoteClient) {
        console.log(
          formatLogMessage('warn', 'TuiMessageRouter', 'No local agents available, forwarding via remote proxy')
        );
        remoteClient.forwardAppMessage(tui.id, messageWithClientId);
        return;
      }

      this.connectionManager.sendError(tui.id, 'No agents available to handle the TUI request', message.id);
      return;
    }

    remoteClient?.forwardAppMessage(tui.id, messageWithClientId);
  }
}
