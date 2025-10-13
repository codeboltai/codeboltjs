import { ClientConnection, ProjectInfo, formatLogMessage } from '../../types';

/**
 * Manages lifecycle and operations for application WebSocket connections.
 */
export class AppConnectionsManager {
  private static instance: AppConnectionsManager;

  private readonly apps = new Map<string, ClientConnection>();

  private constructor() {}

  static getInstance(): AppConnectionsManager {
    if (!AppConnectionsManager.instance) {
      AppConnectionsManager.instance = new AppConnectionsManager();
    }

    return AppConnectionsManager.instance;
  }

  registerApp(connection: ClientConnection): void {
    this.apps.set(connection.id, connection);
    console.log(
      formatLogMessage(
        'info',
        'AppConnectionsManager',
        `App registered: ${connection.id}${connection.currentProject ? ` with project: ${connection.currentProject.path}` : ''}${connection.instanceId ? ` and instanceId: ${connection.instanceId}` : ''}`
      )
    );
  }

  removeApp(appId: string): void {
    if (this.apps.delete(appId)) {
      console.log(formatLogMessage('info', 'AppConnectionsManager', `App disconnected: ${appId}`));
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

  sendToApp(appId: string, message: unknown): boolean {
    const app = this.apps.get(appId);

    if (!app) {
      console.warn(formatLogMessage('warn', 'AppConnectionsManager', `App ${appId} not found`));
      return false;
    }

    try {
      app.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'AppConnectionsManager', `Message sent to app ${appId}`));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'AppConnectionsManager', `Error sending message to app ${appId}: ${error}`));
      return false;
    }
  }

  broadcast(message: unknown): void {
    this.apps.forEach((app) => {
      try {
        app.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(formatLogMessage('error', 'AppConnectionsManager', `Error broadcasting to app ${app.id}: ${error}`));
      }
    });
  }
}
