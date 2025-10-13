import { ClientConnection, ProjectInfo, formatLogMessage } from '../../types';

/**
 * Manages lifecycle and operations for TUI WebSocket connections.
 */
export class TuiConnectionsManager {
  private static instance: TuiConnectionsManager;

  private readonly tuis = new Map<string, ClientConnection>();

  private constructor() {}

  static getInstance(): TuiConnectionsManager {
    if (!TuiConnectionsManager.instance) {
      TuiConnectionsManager.instance = new TuiConnectionsManager();
    }

    return TuiConnectionsManager.instance;
  }

  registerTui(connection: ClientConnection): void {
    this.tuis.set(connection.id, connection);
    console.log(
      formatLogMessage(
        'info',
        'TuiConnectionsManager',
        `TUI registered: ${connection.id}${connection.currentProject ? ` with project: ${connection.currentProject.path}` : ''}${connection.instanceId ? ` and instanceId: ${connection.instanceId}` : ''}`
      )
    );
  }

  removeTui(tuiId: string): void {
    if (this.tuis.delete(tuiId)) {
      console.log(formatLogMessage('info', 'TuiConnectionsManager', `TUI disconnected: ${tuiId}`));
    }
  }

  getTui(tuiId: string): ClientConnection | undefined {
    return this.tuis.get(tuiId);
  }

  getAllTuis(): ClientConnection[] {
    return Array.from(this.tuis.values());
  }

  getTuiCount(): number {
    return this.tuis.size;
  }

  sendToTui(tuiId: string, message: unknown): boolean {
    const tui = this.tuis.get(tuiId);

    if (!tui) {
      console.warn(formatLogMessage('warn', 'TuiConnectionsManager', `TUI ${tuiId} not found`));
      return false;
    }

    try {
      tui.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'TuiConnectionsManager', `Message sent to TUI ${tuiId}`));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'TuiConnectionsManager', `Error sending message to TUI ${tuiId}: ${error}`));
      return false;
    }
  }

  broadcast(message: unknown): void {
    this.tuis.forEach((tui) => {
      try {
        tui.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(formatLogMessage('error', 'TuiConnectionsManager', `Error broadcasting to TUI ${tui.id}: ${error}`));
      }
    });
  }



  getTuiProject(tuiId: string): ProjectInfo | undefined {
    return this.tuis.get(tuiId)?.currentProject;
  }
}