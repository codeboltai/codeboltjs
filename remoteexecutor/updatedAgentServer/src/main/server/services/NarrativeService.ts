import { NarrativeClient } from '@codebolt/narrative';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../../utils/logger';

/**
 * Singleton service wrapping NarrativeClient for remote snapshot import/export.
 * Enables the remote executor to receive snapshot archives from the server,
 * populate the workspace, and export bundles back for PR creation.
 */
export class NarrativeService {
  private static instance: NarrativeService;
  private client: NarrativeClient | null = null;
  private environmentId: string | null = null;
  private workspacePath: string | null = null;
  private importedSnapshotId: string | null = null;
  private serverSnapshotId: string | null = null;
  private narrativeContext: {
    objective_id: string;
    narrative_thread_id: string;
    agent_run_id: string;
  } | null = null;

  private constructor() {}

  static getInstance(): NarrativeService {
    if (!NarrativeService.instance) {
      NarrativeService.instance = new NarrativeService();
    }
    return NarrativeService.instance;
  }

  /**
   * Initialize NarrativeClient in remote mode.
   */
  async initialize(environmentId: string, workspace: string): Promise<void> {
    this.client = new NarrativeClient({
      environmentId,
      workspace,
      remote: true,
    });
    await this.client.start();
    this.environmentId = environmentId;
    this.workspacePath = workspace;
    logger.info(`NarrativeService initialized for environment ${environmentId} at ${workspace}`);
  }

  /**
   * Import a snapshot archive from base64-encoded data.
   * Decodes to a temp file, imports via NarrativeClient, and returns the result.
   */
  async importArchive(
    archiveBase64: string,
    options: {
      environmentId: string;
      environmentName: string;
      snapshotId?: string;
      workspacePath?: string;
      narrativeContext?: {
        objective_id: string;
        narrative_thread_id: string;
        agent_run_id: string;
      };
    }
  ): Promise<{ snapshot_id: string; tree_hash: string }> {
    const workspace =
      options.workspacePath ||
      path.join(os.tmpdir(), 'codebolt-remote', options.environmentName);

    if (!this.client) {
      await fs.promises.mkdir(workspace, { recursive: true });
      await this.initialize(options.environmentId, workspace);
    }

    // Decode base64 and save to temp file
    const archiveBuffer = Buffer.from(archiveBase64, 'base64');
    const tempArchivePath = path.join(
      os.tmpdir(),
      `snapshot-${options.environmentId}-${Date.now()}.tar.gz`
    );
    await fs.promises.writeFile(tempArchivePath, archiveBuffer);

    // Store server snapshot ID for diff base during export
    this.serverSnapshotId = options.snapshotId || null;

    // Store parent's narrative context for use during export
    this.narrativeContext = options.narrativeContext || null;

    try {
      const result = await this.client!.snapshot.importSnapshotArchive({
        archive_path: tempArchivePath,
        thread_id: 'remote-executor-init',
        remote_environment_id: options.environmentId,
      });

      this.importedSnapshotId = result.snapshot_id;

      logger.info(
        `NarrativeService imported archive for environment ${options.environmentId}: snapshot=${result.snapshot_id}`
      );

      return { snapshot_id: result.snapshot_id, tree_hash: result.tree_hash };
    } finally {
      // Clean up temp file
      await fs.promises.unlink(tempArchivePath).catch(() => {});
    }
  }

  /**
   * Export a snapshot bundle as base64 data for sending back to the server.
   * Creates narrative hierarchy, snapshots workspace, and exports as git bundle.
   */
  async exportBundle(): Promise<{
    bundleData: string;
    snapshotId: string;
    baseSnapshotId: string | null;
    narrativeContext?: {
      objective_id: string;
      narrative_thread_id: string;
      agent_run_id: string;
    };
  }> {
    if (!this.client) {
      throw new Error('NarrativeService not initialized — import an archive first');
    }

    let agent_run_id: string;

    if (this.narrativeContext) {
      // Use the parent's agent_run_id so the snapshot is attributed to the user's actual task
      agent_run_id = this.narrativeContext.agent_run_id;
      logger.info(
        `NarrativeService using parent narrative context: agent_run_id=${agent_run_id}`
      );
    } else {
      // Fallback: create a throwaway hierarchy (no parent context available)
      logger.warn(
        `[NarrativeService:exportBundle] No parent narrative context — creating fallback hierarchy for environment ${this.environmentId}`
      );
      const { objective_id } = await this.client.narrative.createObjective({
        description: `Export from remote environment: ${this.environmentId}`,
      });
      const { thread_id } = await this.client.narrative.createThread({
        objective_id,
        name: `remote-export-${this.environmentId}`,
      });
      const result = await this.client.narrative.createAgentRun({
        thread_id,
        agent_name: `remote-export-${this.environmentId}`,
      });
      agent_run_id = result.agent_run_id;
      logger.info(
        `[NarrativeService:exportBundle] Fallback hierarchy created: objective=${objective_id}, thread=${thread_id}, agent_run=${agent_run_id}`
      );
    }

    // Create snapshot of current workspace
    logger.info(
      `[NarrativeService:exportBundle] Creating snapshot for environment ${this.environmentId} with agent_run_id=${agent_run_id}`
    );
    const snapshotResult = await this.client.snapshot.createSnapshot({
      agent_run_id,
      description: `Remote export snapshot for ${this.environmentId}`,
    });
    logger.info(
      `[NarrativeService:exportBundle] Snapshot created: snapshot_id=${snapshotResult.snapshot_id}, tree_hash=${snapshotResult.tree_hash}`
    );

    // Export as git bundle
    logger.info(
      `[NarrativeService:exportBundle] Exporting snapshot ${snapshotResult.snapshot_id} as git bundle (incremental=false)`
    );
    const bundleResult = await this.client.snapshot.exportSnapshotBundle({
      snapshot_id: snapshotResult.snapshot_id,
      incremental: false,
    });
    logger.info(
      `[NarrativeService:exportBundle] Bundle created at: ${bundleResult.bundle_path}`
    );

    // Read bundle file and base64 encode
    const bundleBuffer = await fs.promises.readFile(bundleResult.bundle_path);
    const bundleData = bundleBuffer.toString('base64');
    const bundleSizeKB = Math.round(bundleBuffer.length / 1024);

    logger.info(
      `[NarrativeService:exportBundle] Export complete for environment ${this.environmentId}: ` +
      `snapshot=${snapshotResult.snapshot_id}, baseSnapshot=${this.serverSnapshotId || 'none'}, ` +
      `bundleSize=${bundleSizeKB}KB, hasNarrativeContext=${!!this.narrativeContext}`
    );

    return {
      bundleData,
      snapshotId: snapshotResult.snapshot_id,
      baseSnapshotId: this.serverSnapshotId,
      // Echo back narrative context so the parent server can complete the agent run
      ...(this.narrativeContext ? { narrativeContext: this.narrativeContext } : {}),
    };
  }

  /**
   * Shutdown the NarrativeClient and release resources.
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
      logger.info('NarrativeService shut down');
    }
  }

  get isInitialized(): boolean {
    return this.client !== null;
  }

  getWorkspacePath(): string | null {
    return this.workspacePath;
  }

  getImportedSnapshotId(): string | null {
    return this.importedSnapshotId;
  }

  getServerSnapshotId(): string | null {
    return this.serverSnapshotId;
  }

  getNarrativeContext(): { objective_id: string; narrative_thread_id: string; agent_run_id: string } | null {
    return this.narrativeContext;
  }
}
