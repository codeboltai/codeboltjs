import express from 'express';
import { EnvironmentController } from '../controllers/EnvironmentController';

export class EnvironmentRoutes {
    public router: express.Router;
    private environmentController: EnvironmentController;

    constructor() {
        this.router = express.Router();
        this.environmentController = new EnvironmentController();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.router.post('/:id/create-pr', this.environmentController.createPullRequest.bind(this.environmentController));
    }
}
