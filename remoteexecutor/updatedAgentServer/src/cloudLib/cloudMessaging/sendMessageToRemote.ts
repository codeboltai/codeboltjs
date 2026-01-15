import { ClientConnection, Message, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../main/core/connectionManagers/connectionManager';
import { RemoteProxyClient } from '../cloudConnectionManager/remoteProxyClient';
import { BaseApplicationResponse } from '@codebolt/types/sdk';
import { logger } from '../../main/utils/logger';
import {
  FileDeleteConfirmation,
  FileReadConfirmation,
  FileReadSuccess,
  FileWriteConfirmation,
  FileWriteSuccess,
  SearchConfirmation,
  SearchInProgress,
  SearchSuccess,
  SearchError,
  SearchRejected,
  fileWriteErrorSchema,
  FileWriteError,
  FileWriteRejected,
  ListDirectorySuccess,
  ListDirectoryError,
  FolderReadConfirmation,
  FolderReadRejected,
  FolderReadSuccess,
  FolderReadError
} from '@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas';
import { ReadFileEvent, GrepSearchEvent } from '@codebolt/types/agent-to-app-ws-types';
import { GrepSearchSuccessResponse, GrepSearchErrorResponse } from '@codebolt/types/app-to-agent-ws-types';

/**
 * Encapsulates outgoing traffic to the remote proxy.
 */
export class SendMessageToRemote {
  private readonly connectionManager = ConnectionManager.getInstance();

  private get remoteClient(): RemoteProxyClient | undefined {
    return RemoteProxyClient.getInstance();
  }

  forwardAgentMessage(
    agent: ClientConnection,
    message:
      | Message
      | FileReadConfirmation
      | FileReadSuccess
      | ReadFileEvent
      | FileWriteConfirmation
      | FileWriteSuccess
      | FileDeleteConfirmation
      | SearchConfirmation
      | SearchInProgress
      | SearchSuccess
      | SearchError
      | SearchRejected
      | GrepSearchEvent
      | GrepSearchSuccessResponse
      | GrepSearchErrorResponse
      |FileWriteError
      |FileWriteRejected
      |ListDirectorySuccess
      |ListDirectoryError
      |FolderReadConfirmation
      |FolderReadRejected
      |FolderReadSuccess
      | FileWriteSuccess 
      
      | FolderReadError,
      
    options?: { requireRemote?: boolean }
  ): void {
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
