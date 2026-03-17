import { ClientConnection, formatLogMessage } from "../../types";

import { UserMessage, BaseApplicationResponse } from "@codebolt/types/sdk";

import { ConnectionManager } from "../../main/core/connectionManagers/connectionManager";
import { NotificationService } from "../../main/server/services/NotificationService";
import { NarrativeService } from "../../main/server/services/NarrativeService";
import { SendMessageToAgent } from "../../agentLib/agentMessaging/sendMessageToAgent";
import { SendMessageToRemote } from "../../cloudLib/cloudMessaging/sendMessageToRemote";
import { logger } from "../../main/utils/logger";
import {
  ReadFileHandler,
  type ReadFileConfirmation,
} from "../../localexecutions/file/readFileHandler";

import {
  WriteFileHandler,
  type WriteFileConfirmation,
} from "../../localexecutions/file/writeFileHandler";

import { AgentTypeEnum } from "@/types/cli";
import type {
  SnapshotArchiveImportMessage,
  SnapshotExportRequest,
} from "../../types/messages";
import { getServerConfig } from "../../main/config/config";

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class AppMessageRouter {
  private connectionManager: ConnectionManager;
  private sendMessageToAgent: SendMessageToAgent;
  private notificationService: NotificationService;
  private sendMessageToRemote: SendMessageToRemote;
  private readFileHandler: ReadFileHandler;
  private writeFileHandler: WriteFileHandler;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToAgent = new SendMessageToAgent();
    this.sendMessageToRemote = new SendMessageToRemote();
    this.notificationService = NotificationService.getInstance();
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
  }

  /**
   * Handle responses from apps (responding back to agent requests)
   */
  handleAppResponse(
    app: ClientConnection,
    message: UserMessage | BaseApplicationResponse
  ): void {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling app response: ${message.type} from ${app.id}`
      )
    );

    // Handle snapshot archive import
    if (message.type === "snapshotArchiveImport") {
      this.handleSnapshotImport(app, message as unknown as SnapshotArchiveImportMessage);
      return;
    }

    // Handle snapshot export request
    if (message.type === "snapshotExportRequest") {
      this.handleSnapshotExport(app, message as unknown as SnapshotExportRequest);
      return;
    }

    // Handle setNarrativeContext — update the NarrativeService with the parent server's context
    if (message.type === "setNarrativeContext") {
      const ctx = (message as any).narrativeContext;
      if (ctx?.objective_id && ctx?.narrative_thread_id && ctx?.agent_run_id) {
        const narrativeService = NarrativeService.getInstance();
        narrativeService.setNarrativeContext(ctx);
      }
      return;
    }

    // Handle confirmation responses
    if (message.type === "confirmationResponse") {
      // Create proper confirmation objects that match the expected interface
      // We need to map the incoming message to the expected format
      const confirmationMessage = {
        type: "confirmationResponse",
        messageId: (message as any).messageId || (message as any).requestId || "",
        userMessage: (message as any).userMessage || (message as any).message || "approve"
      };

      // Route the confirmation to the appropriate handler based on the message content
      // For now, we'll try both handlers as we don't have a way to distinguish between them
      // In a real implementation, we would need to track which handler created the pending request
      this.readFileHandler.handleConfirmation(confirmationMessage as ReadFileConfirmation);
      this.writeFileHandler.handleConfirmation(confirmationMessage as WriteFileConfirmation);
      return;
    }

    if (message.type == "messageResponse") {
      this.handleInitialUserMessage(app, message as UserMessage);
    } else {
      this.sendMessageToAgent.sendResponseToAgent(
        app,
        message as BaseApplicationResponse
      );
    }

    this.sendMessageToRemote.forwardAppMessage(
      app.id,
      message as BaseApplicationResponse
    );
  }

  private async handleSnapshotImport(
    app: ClientConnection,
    message: SnapshotArchiveImportMessage
  ): Promise<void> {
    const narrativeService = NarrativeService.getInstance();
    try {
      const result = await narrativeService.importArchive(message.archiveData, {
        environmentId: message.environmentId,
        environmentName: message.environmentName,
        snapshotId: message.snapshotId,
        workspacePath: message.workspacePath,
        narrativeContext: message.narrativeContext,
      });
      app.ws.send(
        JSON.stringify({
          type: 'snapshotArchiveImportResult',
          success: true,
          snapshotId: result.snapshot_id,
          treeHash: result.tree_hash,
          environmentId: message.environmentId,
        })
      );
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'AppMessageRouter', `Snapshot import failed: ${(error as Error).message}`)
      );
      app.ws.send(
        JSON.stringify({
          type: 'snapshotArchiveImportResult',
          success: false,
          environmentId: message.environmentId,
          error: (error as Error).message,
        })
      );
    }
  }

  private async handleSnapshotExport(
    app: ClientConnection,
    message: SnapshotExportRequest
  ): Promise<void> {
    const narrativeService = NarrativeService.getInstance();
    try {
      // Auto-initialize NarrativeService if no archive was imported beforehand
      // (e.g. workspace was populated via git clone instead of snapshot import)
      if (!narrativeService.isInitialized) {
        const config = getServerConfig();
        const workspace = config.projectPath || process.cwd();
        await narrativeService.initialize(message.environmentId, workspace);
      }
      const result = await narrativeService.exportBundle();
      app.ws.send(
        JSON.stringify({
          type: 'snapshotBundleExport',
          bundleData: result.bundleData,
          snapshotId: result.snapshotId,
          baseSnapshotId: result.baseSnapshotId,
          environmentId: message.environmentId,
          success: true,
          ...(result.narrativeContext ? { narrativeContext: result.narrativeContext } : {}),
        })
      );
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'AppMessageRouter', `Snapshot export failed: ${(error as Error).message}`)
      );
      app.ws.send(
        JSON.stringify({
          type: 'snapshotBundleExport',
          bundleData: '',
          snapshotId: '',
          baseSnapshotId: null,
          environmentId: message.environmentId,
          success: false,
          error: (error as Error).message,
        })
      );
    }
  }

  handleInitialUserMessage(app: ClientConnection, message: UserMessage): void {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling initial user message: ${message.type} from ${app.id}`
      )
    );

    // Only set selectedAgent if not already provided in the message
    if (message.message.selectedAgent) {
      // message.message.selectedAgent = {
      //   "agentDetails": "cli-agent",
      //   "agentType": AgentTypeEnum.marketplace,
      //   "id": "cli-agent",
      //   "name": "Ask Agent"
      // };
    }

    this.sendMessageToAgent.sendInitialMessage(message, app.id);
  }
}