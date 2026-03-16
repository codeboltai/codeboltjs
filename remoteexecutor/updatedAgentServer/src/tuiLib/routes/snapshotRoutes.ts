import express, { Request, Response } from 'express';
import { NarrativeService } from '../../main/server/services/NarrativeService';
import { logger } from '../../main/utils/logger';

export class SnapshotRoutes {
  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // POST /snapshot/import - Import archive via HTTP (accepts raw gzip body)
    this.router.post(
      '/import',
      express.raw({ type: 'application/gzip', limit: '500mb' }),
      async (req: Request, res: Response) => {
        try {
          const { environmentId, environmentName, snapshotId, objective_id, narrative_thread_id, agent_run_id } = req.query;
          if (!environmentId || !environmentName) {
            res.status(400).json({ success: false, error: 'environmentId and environmentName are required' });
            return;
          }
          const archiveBase64 = (req.body as Buffer).toString('base64');
          const narrativeService = NarrativeService.getInstance();
          const narrativeContext = objective_id && narrative_thread_id && agent_run_id
            ? {
                objective_id: objective_id as string,
                narrative_thread_id: narrative_thread_id as string,
                agent_run_id: agent_run_id as string,
              }
            : undefined;
          const result = await narrativeService.importArchive(archiveBase64, {
            environmentId: environmentId as string,
            environmentName: environmentName as string,
            snapshotId: snapshotId as string | undefined,
            narrativeContext,
          });
          res.json({ success: true, ...result });
        } catch (error) {
          logger.error(`Snapshot import HTTP error: ${(error as Error).message}`);
          res.status(500).json({ success: false, error: (error as Error).message });
        }
      }
    );

    // POST /snapshot/export - Export bundle via HTTP (returns raw binary)
    this.router.post('/export', async (_req: Request, res: Response) => {
      try {
        const narrativeService = NarrativeService.getInstance();
        const result = await narrativeService.exportBundle();
        const bundleBuffer = Buffer.from(result.bundleData, 'base64');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('X-Snapshot-Id', result.snapshotId);
        res.setHeader('X-Base-Snapshot-Id', result.baseSnapshotId || '');
        if (result.narrativeContext) {
          res.setHeader('X-Narrative-Objective-Id', result.narrativeContext.objective_id);
          res.setHeader('X-Narrative-Thread-Id', result.narrativeContext.narrative_thread_id);
          res.setHeader('X-Narrative-Agent-Run-Id', result.narrativeContext.agent_run_id);
        }
        res.send(bundleBuffer);
      } catch (error) {
        logger.error(`Snapshot export HTTP error: ${(error as Error).message}`);
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // GET /snapshot/status - Check narrative service status
    this.router.get('/status', (_req: Request, res: Response) => {
      const narrativeService = NarrativeService.getInstance();
      res.json({
        initialized: narrativeService.isInitialized,
        workspacePath: narrativeService.getWorkspacePath(),
        importedSnapshotId: narrativeService.getImportedSnapshotId(),
        serverSnapshotId: narrativeService.getServerSnapshotId(),
        narrativeContext: narrativeService.getNarrativeContext(),
      });
    });
  }
}
