import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../main/core/connectionManagers/connectionManager.js";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../main/utils/logger";
import { PermissionManager, PermissionUtils } from "./localAgentRequestFulfilment/PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

import type {
  FileReadConfirmation,
  FileReadSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";
import { WriteFileConfirmation } from "./localAgentRequestFulfilment/writeFileHandler";
import { GetChatHistoryEvent } from "@codebolt/types/agent-to-app-ws-types";

import type {ChatHistoryResponse} from '@codebolt/types/app-to-agent-ws-types'



export class ChatHistoryHandler {
  private connectionManager = ConnectionManager.getInstance();
  private fileServices: FileServices;
  private permissionManager: PermissionManager;
  private approvalService = new ApprovalService();
  private notificationService = NotificationService.getInstance();
  private clientResolver = new ClientResolver();



  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(), // Use current working directory as target
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
    
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  async handleChatHistoryEvent(agent: ClientConnection, event: GetChatHistoryEvent): Promise<void> {
    
    this.connectionManager.sendToConnection(agent.id,{ type: "getChatHistoryResponse", chats:[]  }  );
  }

 

}
