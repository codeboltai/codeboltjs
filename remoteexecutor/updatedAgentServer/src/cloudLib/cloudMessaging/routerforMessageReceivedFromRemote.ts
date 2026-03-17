import { formatLogMessage, Message } from '../../types';
import { ConnectionManager } from '../../main/core/connectionManagers/connectionManager';
import { NarrativeService } from '../../main/server/services/NarrativeService';
import { SendMessageToTui } from '../../tuiLib/tuiMessaging/sendMessageToTui';
import { SendMessageToRemote } from './sendMessageToRemote';
import { logger } from '../../main/utils/logger';
import type {
  SnapshotArchiveImportMessage,
  SnapshotExportRequest,
} from '../../types/messages';
import { getServerConfig } from '../../main/config/config';

/**
 * Routes inbound messages arriving from the remote proxy to local recipients.
 */
export class RemoteMessageRouter {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToTui = new SendMessageToTui();

  handleRemoteMessage(message: Message): void {
    logger.info(formatLogMessage('info', 'RemoteMessageRouter', `Handling remote message of type ${message.type}`));

    // Handle snapshot archive import from cloud proxy
    if (message.type === 'snapshotArchiveImport') {
      this.handleSnapshotImport(message as unknown as SnapshotArchiveImportMessage);
      return;
    }

    // Handle snapshot export request from cloud proxy
    if (message.type === 'snapshotExportRequest') {
      this.handleSnapshotExport(message as unknown as SnapshotExportRequest);
      return;
    }

    const { target, agentId, clientId, tuiId } = message as Message & {
      target?: 'agent' | 'app' | 'tui';
      agentId?: string;
      clientId?: string;
      tuiId?: string;
    };

    switch (target) {
      case 'agent':
        this.forwardToAgent(agentId, message);
        break;
      case 'tui':
        this.forwardToTui(tuiId ?? clientId, message);
        break;
      case 'app':
      default:
        this.forwardToApp(clientId, message);
        break;
    }
  }

  private async handleSnapshotImport(message: SnapshotArchiveImportMessage): Promise<void> {
    const narrativeService = NarrativeService.getInstance();
    const sendRemote = new SendMessageToRemote();
    try {
      const result = await narrativeService.importArchive(message.archiveData, {
        environmentId: message.environmentId,
        environmentName: message.environmentName,
        snapshotId: message.snapshotId,
        workspacePath: message.workspacePath,
        narrativeContext: message.narrativeContext,
      });
      sendRemote.forwardAppMessage(undefined, {
        type: 'snapshotArchiveImportResult',
        success: true,
        snapshotId: result.snapshot_id,
        treeHash: result.tree_hash,
        environmentId: message.environmentId,
      } as any);
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'RemoteMessageRouter', `Snapshot import failed: ${(error as Error).message}`)
      );
      sendRemote.forwardAppMessage(undefined, {
        type: 'snapshotArchiveImportResult',
        success: false,
        environmentId: message.environmentId,
        error: (error as Error).message,
      } as any);
    }
  }

  private async handleSnapshotExport(message: SnapshotExportRequest): Promise<void> {
    const narrativeService = NarrativeService.getInstance();
    const sendRemote = new SendMessageToRemote();
    try {
      // Auto-initialize NarrativeService if no archive was imported beforehand
      if (!narrativeService.isInitialized) {
        const config = getServerConfig();
        const workspace = config.projectPath || process.cwd();
        await narrativeService.initialize(message.environmentId, workspace);
      }
      const result = await narrativeService.exportBundle();
      sendRemote.forwardAppMessage(undefined, {
        type: 'snapshotBundleExport',
        bundleData: result.bundleData,
        snapshotId: result.snapshotId,
        baseSnapshotId: result.baseSnapshotId,
        environmentId: message.environmentId,
        success: true,
        ...(result.narrativeContext ? { narrativeContext: result.narrativeContext } : {}),
        ...(result.narrativeSummary ? { narrativeSummary: result.narrativeSummary } : {}),
      } as any);
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'RemoteMessageRouter', `Snapshot export failed: ${(error as Error).message}`)
      );
      sendRemote.forwardAppMessage(undefined, {
        type: 'snapshotBundleExport',
        bundleData: '',
        snapshotId: '',
        baseSnapshotId: null,
        environmentId: message.environmentId,
        success: false,
        error: (error as Error).message,
      } as any);
    }
  }

  private forwardToAgent(agentId: string | undefined, message: Message): void {
    const agentManager = this.connectionManager.getAgentConnectionManager();

    if (agentId) {
      agentManager
        .sendToSpecificAgent(agentId, 'remote-proxy', message)
        .catch((error) =>
          logger.error(
            formatLogMessage('error', 'RemoteMessageRouter', `Failed to send remote message to agent ${agentId}: ${error}`)
          )
        );
      return;
    }

    agentManager.sendToAgent(message);
  }

  private forwardToApp(clientId: string | undefined, message: Message): void {
    const appManager = this.connectionManager.getAppConnectionManager();

    if (clientId) {
      const delivered = appManager.sendToApp(clientId, message);
      if (!delivered) {
        logger.warn(
          formatLogMessage('warn', 'RemoteMessageRouter', `Remote message failed to reach local app ${clientId}`)
        );
      }
      return;
    }

    appManager.broadcast(message);
  }

  private forwardToTui(tuiId: string | undefined, message: Message): void {
    if (tuiId) {
      const delivered = this.sendMessageToTui.sendToTui(tuiId, message);
      if (!delivered) {
        logger.warn(
          formatLogMessage('warn', 'RemoteMessageRouter', `Remote message failed to reach local TUI ${tuiId}`)
        );
      }
    } else {
      this.sendMessageToTui.broadcast(message);
    }
  }
}
