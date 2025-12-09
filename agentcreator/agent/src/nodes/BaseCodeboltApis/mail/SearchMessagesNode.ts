import { BaseSearchMessagesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class SearchMessagesNode extends BaseSearchMessagesNode {
    async onExecute() {
        const query = this.getInputData(1) as string;
        const agentId = this.getInputData(2) as string;
        const limit = this.getInputData(3) as number;

        try {
            const response = await codebolt.mail.search({ query, agentId, limit });
            handleMailResponse(this, response, 2, 3, { messages: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
