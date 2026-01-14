import { Request, Response } from 'express';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { logger } from '../main/utils/logger';
import { formatLogMessage } from '../types';

export class EnvironmentController {
    private connectionManager: ConnectionManager;

    constructor() {
        this.connectionManager = ConnectionManager.getInstance();
    }

    public async createPullRequest(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        logger.info(formatLogMessage('info', 'EnvironmentController', `Create PR requested for environment: ${id}`));

        try {
            // Find the app connection associated with this environment ID
            // Assuming the environment ID corresponds to the connection ID or is part of the project info
            // For now, we'll try to find a connection that matches the ID directly
            const connection = this.connectionManager.getConnection(id);

            if (!connection) {
                // If not found by ID, try to find by project name (environment name)
                // This part depends on how the environment ID is mapped. 
                // If the ID passed is the environment name, we might need to search for it.
                const allApps = this.connectionManager.getAppConnectionManager().getAllApps();
                const app = allApps.find(a => a.currentProject?.path.endsWith(id) || a.currentProject?.path.includes(id));

                if (app) {
                    this.sendPRRequest(app.id, res);
                    return;
                }

                logger.warn(formatLogMessage('warn', 'EnvironmentController', `Environment not found: ${id}`));
                res.status(404).json({ error: 'Environment not found' });
                return;
            }

            this.sendPRRequest(id, res);

        } catch (error: any) {
            logger.error(formatLogMessage('error', 'EnvironmentController', `Error creating PR: ${error.message}`));
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    private sendPRRequest(connectionId: string, res: Response) {
        const success = this.connectionManager.getAppConnectionManager().sendToApp(connectionId, {
            type: 'providerSendPR',
        } as any);

        if (success) {
            res.json({ message: 'Pull request creation initiated' });
        } else {
            res.status(500).json({ error: 'Failed to send request to provider' });
        }
    }
}
