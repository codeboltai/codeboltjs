import { Message, ReadFileEvent } from '@codebolt/types/agent-to-app-ws-types';
import { ClientConnection, ProjectInfo, formatLogMessage } from '../../types';
import { logger } from '../../utils/logger';
import { FileDeleteConfirmation, FileDeleteSuccess, FileReadConfirmation, FileReadSuccess, FileWriteConfirmation, FileWriteError, FileWriteSuccess, SearchConfirmation, SearchError, SearchInProgress, SearchRejected, SearchSuccess } from '@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas';

/**
 * Manages lifecycle and operations for application WebSocket connections.
 */
export class AppConnectionsManager {
  private static instance: AppConnectionsManager;

  private readonly apps = new Map<string, ClientConnection>();

  private constructor() { }

  static getInstance(): AppConnectionsManager {
    if (!AppConnectionsManager.instance) {
      AppConnectionsManager.instance = new AppConnectionsManager();
    }

    return AppConnectionsManager.instance;
  }

  registerApp(connection: ClientConnection): void {
    this.apps.set(connection.id, connection);
    logger.info(
      formatLogMessage(
        'info',
        'AppConnectionsManager',
        `App registered: ${connection.id}${connection.currentProject ? ` with project: ${connection.currentProject.path}` : ''}${connection.instanceId ? ` and instanceId: ${connection.instanceId}` : ''}`
      )
    );
  }

  removeApp(appId: string): void {
    if (this.apps.delete(appId)) {
      logger.info(formatLogMessage('info', 'AppConnectionsManager', `App disconnected: ${appId}`));
    }
  }

  getApp(appId: string): ClientConnection | undefined {
    return this.apps.get(appId);
  }

  getAllApps(): ClientConnection[] {
    return Array.from(this.apps.values());
  }

  getAppCount(): number {
    return this.apps.size;
  }

  sendToApp(appId: string, message: Message | ReadFileEvent | FileReadConfirmation | FileReadSuccess | FileWriteConfirmation | FileWriteSuccess | FileWriteError | FileDeleteConfirmation | FileDeleteSuccess | SearchSuccess | SearchError | SearchRejected |SearchInProgress |SearchConfirmation  ): boolean {
    const app = this.apps.get(appId);

    if (!app) {
      logger.warn(formatLogMessage('warn', 'AppConnectionsManager', `App ${appId} not found`));
      return false;
    }

    try {
      app.ws.send(JSON.stringify(message));
      logger.info(formatLogMessage('info', 'AppConnectionsManager', `Message sent to app ${appId}`));
      return true;
    } catch (error) {
      logger.error(formatLogMessage('error', 'AppConnectionsManager', `Error sending message to app ${appId}: ${error}`));
      return false;
    }
  }

  broadcast(message: unknown): void {
    this.apps.forEach((app) => {
      try {
        app.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error(formatLogMessage('error', 'AppConnectionsManager', `Error broadcasting to app ${app.id}: ${error}`));
      }
    });
  }
}
