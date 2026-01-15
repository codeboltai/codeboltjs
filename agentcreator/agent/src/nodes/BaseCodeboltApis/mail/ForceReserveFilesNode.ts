import { BaseForceReserveFilesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class ForceReserveFilesNode extends BaseForceReserveFilesNode {
    async onExecute() {
        const agentId = this.getInputData(1) as string;
        const paths = this.getInputData(2) as string[];
        const reason = this.getInputData(3) as string;

        try {
            const response = await codebolt.mail.forceReserveFiles({ agentId, paths, reason });
            // Outputs: reservationId(1), reserved(2), success(3), error(4)
            handleMailResponse(this, response, 3, 4, { reservationId: 1, reserved: 2 });
        } catch (error: any) {
            this.setOutputData(3, false);
            this.setOutputData(4, error.message || String(error));
        }
    }
}
