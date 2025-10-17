import { ClientConnection, Message, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { RemoteProxyClient } from '../../core/remote/remoteProxyClient';
import { BaseApplicationResponse } from '@codebolt/types/sdk';
import { logger } from '../../utils/logger';
import { FileReadConfirmation, FileReadSuccess } from '@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas';

/**
 * Encapsulates outgoing traffic to the remote proxy.
 */
export class SendMessageToRemote {
  private readonly connectionManager = ConnectionManager.getInstance();

  private get remoteClient(): RemoteProxyClient | undefined {
    return RemoteProxyClient.getInstance();
  }

  forwardAgentMessage(agent: ClientConnection, message: Message | FileReadConfirmation | FileReadSuccess , options?: { requireRemote?: boolean }): void {
    const client = this.remoteClient;
    if (!client) {
      logger.warn(formatLogMessage('warn', 'SendMessageToRemote', 'Remote proxy client not initialized'));
      if (options?.requireRemote) {
        this.connectionManager.sendError(agent.id, 'Remote proxy not configured');
      }
      return;
    }

    logger.info(
      formatLogMessage('info', 'SendMessageToRemote', `Forwarding ${message.type} from agent ${agent.id} to remote proxy`)
    );

    const payload = {
      ...message,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    client.forwardAgentMessage(agent.id, payload);
  }

  forwardAppMessage(appId: string | undefined, message: BaseApplicationResponse, options?: { requireRemote?: boolean }): void {
    const client = this.remoteClient;
    if (!client) {
      logger.warn(formatLogMessage('warn', 'SendMessageToRemote', 'Remote proxy client not initialized'));
      if (options?.requireRemote && appId) {
        this.connectionManager.sendError(appId, 'Remote proxy not configured');
      }
      return;
    }

    logger.info(
      formatLogMessage(
        'info',
        'SendMessageToRemote',
        `Forwarding ${message.type} from app ${appId ?? 'unknown'} to remote proxy`
      )
    );

    client.forwardAppMessage(appId, message);
  }
  forwardTUIMessage(tuiId: string | undefined, message: BaseApplicationResponse, options?: { requireRemote?: boolean }): void {
    const client = this.remoteClient;
    if (!client) {
      logger.warn(formatLogMessage('warn', 'SendMessageToRemote', 'Remote proxy client not initialized'));
      if (options?.requireRemote && tuiId) {
        this.connectionManager.sendError(tuiId, 'Remote proxy not configured');
      }
      return;
    }

    logger.info(
      formatLogMessage(
        'info',
        'SendMessageToRemote',
        `Forwarding ${message.type} from tui ${tuiId ?? 'unknown'} to remote proxy`
      )
    );

    client.forwardAppMessage(tuiId, message);
  }
}
