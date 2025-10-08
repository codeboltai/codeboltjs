import { ClientConnection, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToRemote } from '../remoteMessaging/sendMessageToRemote';
import { BaseApplicationResponse, UserMessage } from '@codebolt/types/sdk';

export class TuiMessageRouter {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();

  handleTuiMessage(tui: ClientConnection, message: UserMessage | BaseApplicationResponse): void {
    console.log(formatLogMessage('info', 'TuiMessageRouter', `Handling TUI message: ${message.type} from ${tui.id}`));

    this.forwardToAgent(tui, message as UserMessage);
  }

  private forwardToAgent(tui: ClientConnection, message: UserMessage ): void {
    const agentManager = this.connectionManager.getAgentConnectionManager();

    const messageWithClientId = {
      ...message,
      clientId: (message as { clientId?: string }).clientId ?? tui.id
    };

    const success = agentManager.sendToAgent(messageWithClientId);

    if (!success) {
      console.log(
        formatLogMessage('warn', 'TuiMessageRouter', 'No local agents available, forwarding via remote proxy')
      );
      this.sendMessageToRemote.forwardAppMessage(tui.id, messageWithClientId, { requireRemote: true });
      this.connectionManager.sendError(tui.id, 'No agents available to handle the TUI request', message.id);
      return;
    }

    this.sendMessageToRemote.forwardAppMessage(tui.id, messageWithClientId);
  }
}
