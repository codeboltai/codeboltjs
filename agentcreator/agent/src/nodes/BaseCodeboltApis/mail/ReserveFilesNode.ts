import { BaseReserveFilesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class ReserveFilesNode extends BaseReserveFilesNode {
    async onExecute() {
        const agentId = this.getInputData(1) as string;
        const paths = this.getInputData(2) as string[];
        const exclusive = this.getInputData(3) as boolean;
        const ttlSeconds = this.getInputData(4) as number;
        const reason = this.getInputData(5) as string;

        try {
            const response = await codebolt.mail.reserveFiles({ agentId, paths, exclusive, ttlSeconds, reason });
            // Outputs: reservationId(1), reserved(2), success(3), error(4)
            handleMailResponse(this, response, 3, 4, { reservationId: 1, reserved: 2 });
        } catch (error: any) {
            this.setOutputData(3, false);
            this.setOutputData(4, error.message || String(error));
        }
    }
}
