import { ClientConnection, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToRemote } from '../remoteMessaging/sendMessageToRemote';
import { BaseApplicationResponse, UserMessage } from '@codebolt/types/sdk';
import { SendMessageToAgent } from '../agentMessaging/sendMessageToAgent';

export class TuiMessageRouter {
  private connectionManager: ConnectionManager;
  private sendMessageToAgent: SendMessageToAgent;
  private sendMessageToRemote: SendMessageToRemote;
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToAgent = new SendMessageToAgent();
    this.sendMessageToRemote = new SendMessageToRemote();
  }

  handleTuiMessage(tui: ClientConnection, message: UserMessage | BaseApplicationResponse): void {
    console.log(formatLogMessage('info', 'TuiMessageRouter', `Handling TUI message: ${message.type} from ${tui.id}`));
    //check if its initial message
    if (message.type == 'messageResponse') {
      this.handleInitialUserMessage(tui, message as UserMessage)
    }
    else {
      this.sendMessageToAgent.sendResponseToAgent(tui, message as BaseApplicationResponse);
    }
    this.sendMessageToRemote.forwardAppMessage(tui.id, message as BaseApplicationResponse);
  }

  handleInitialUserMessage(tui: ClientConnection, message: UserMessage): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Handling initial user message: ${message.type} from ${tui.id}`));
    this.sendMessageToAgent.sendInitialMessage(message);
  }
}
