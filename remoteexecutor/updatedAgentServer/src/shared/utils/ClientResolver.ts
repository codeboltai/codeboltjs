import type { ClientConnection } from "../../types";
import { ConnectionManager } from "../../core/connectionManagers/connectionManager.js";

export type TargetClient = { id: string; type: "app" | "tui" };

/**
 * Utility class for resolving client connections
 */
export class ClientResolver {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Resolves the parent client (app or tui) for a given agent connection
   * @param agent The agent connection
   * @returns The target client (app or tui) or undefined if not found
   */
  resolveParent(agent: ClientConnection): TargetClient | undefined {
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    const parentId = agentManager.getParentByAgent(agent.id);
    if (!parentId) {
      return undefined;
    }

    if (appManager.getApp(parentId)) {
      return { id: parentId, type: "app" };
    }

    if (tuiManager.getTui(parentId)) {
      return { id: parentId, type: "tui" };
    }

    return undefined;
  }

  /**
   * Static method for one-off usage without instantiation
   */
  static resolveParent(agent: ClientConnection): TargetClient | undefined {
    const resolver = new ClientResolver();
    return resolver.resolveParent(agent);
  }
}
