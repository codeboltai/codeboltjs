import { BaseMarkReadNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class MarkReadNode extends BaseMarkReadNode {
    async onExecute() {
        const messageId = this.getInputData(1) as string;
        const agentId = this.getInputData(2) as string;

        try {
            const response = await codebolt.mail.markRead({ messageId, agentId });
            handleMailResponse(this, response, 1, 2, {});
        } catch (error: any) {
            this.setOutputData(1, false);
            this.setOutputData(2, error.message || String(error));
        }
    }
}
