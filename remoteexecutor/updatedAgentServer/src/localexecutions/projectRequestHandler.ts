import * as path from 'path';
import type { ClientConnection } from "../types";
import { ConnectionManager } from "../main/core/connectionManagers/connectionManager.js";
import { logger } from "../main/utils/logger";
import { formatLogMessage } from "../types/utils";
import { ProjectEvent } from "@codebolt/types/agent-to-app-ws-types";



export class ProjectRequestHandler {
  private connectionManager = ConnectionManager.getInstance();
  constructor() {}

  async handleProjectEvent(agent: ClientConnection, event: ProjectEvent): Promise<void> {
    const projectPath = agent.currentProject?.path || process.cwd();
    const projectName = agent.currentProject?.name || path.basename(projectPath);
    const action = (event as any).action as string;
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'getProjectPath': {
        this.connectionManager.sendToConnection(agent.id, {
          type: 'getProjectPathResponse',
          success: true,
          message: 'Project path retrieved successfully',
          timestamp,
          requestId: event.requestId,
          projectPath,
          projectName,
        });
        break;
      }

      case 'getProjectSettings': {
        // Return project settings matching main app structure
        const projectSettings: Record<string, unknown> = {
          user_active_project_path: projectPath,
          projectName,
          projectType: agent.currentProject?.type || 'unknown',
          ...(agent.currentProject?.metadata || {}),
        };
        this.connectionManager.sendToConnection(agent.id, {
          type: 'getProjectSettingsResponse',
          success: true,
          message: 'Project settings retrieved successfully',
          timestamp,
          requestId: event.requestId,
          projectSettings,
        });
        break;
      }

      case 'getRepoMap': {
        // Main app calls get_repo_map(); in remote mode return empty
        this.connectionManager.sendToConnection(agent.id, {
          type: 'getRepoMapResponse',
          success: true,
          message: 'Project repomap retrieved successfully',
          timestamp,
          requestId: event.requestId,
          repoMap: '',
        });
        break;
      }

      case 'getEditorFileStatus': {
        // Match main app's default response format
        const defaultDetails = "\n\n# Codebolt Visible Files\n(Currently not available - using default values)\n\n# Codebolt Open Tabs\n(Currently not available - using default values)";
        this.connectionManager.sendToConnection(agent.id, {
          type: 'getEditorFileStatusResponse',
          success: true,
          message: 'Default editor status retrieved',
          timestamp,
          requestId: event.requestId,
          editorStatus: defaultDetails,
        });
        break;
      }

      case 'runProject': {
        // runProject is fire-and-forget in the SDK (no response expected)
        logger.info(
          formatLogMessage("info", "ProjectRequestHandler", `runProject requested but not supported in remote execution mode`)
        );
        break;
      }

      default: {
        // Match main app's error response for unknown actions
        logger.warn(
          formatLogMessage("warn", "ProjectRequestHandler", `Unknown project action: ${action}`)
        );
        this.connectionManager.sendToConnection(agent.id, {
          type: 'error',
          success: false,
          message: `Unknown project action: ${action}`,
          error: `Unknown project action: ${action}`,
          timestamp,
          requestId: event.requestId,
        });
        break;
      }
    }
  }
}
