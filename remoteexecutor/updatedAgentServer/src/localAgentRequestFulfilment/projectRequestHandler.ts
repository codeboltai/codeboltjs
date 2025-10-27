import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

import type {
  FileReadConfirmation,
  FileReadSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";
import { WriteFileConfirmation } from "./writeFileHandler";
import { GetChatHistoryEvent, ProjectEvent } from "@codebolt/types/agent-to-app-ws-types";

import type { ChatHistoryResponse, GetProjectPathResponse } from '@codebolt/types/app-to-agent-ws-types'



export class ProjectRequestHandler {
  private connectionManager = ConnectionManager.getInstance();
  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(), // Use current working directory as target
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };

  }

  async handleProjectEvent(agent: ClientConnection, event: ProjectEvent): Promise<void> {
    const projectPathResponse: GetProjectPathResponse = {
      type: 'getProjectPathResponse',
      success: true,
      message: 'Project path retrieved successfully',

      requestId: event.requestId,
      projectPath: process.cwd(),
      projectName: 'Testing Project'
    };
    this.connectionManager.sendToConnection(agent.id, projectPathResponse);
  }



}
