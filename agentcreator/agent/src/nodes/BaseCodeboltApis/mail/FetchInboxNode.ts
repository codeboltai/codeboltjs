import { BaseFetchInboxNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class FetchInboxNode extends BaseFetchInboxNode {
    async onExecute() {
        const agentId = this.getInputData(1) as string;
        const unreadOnly = this.getInputData(2) as boolean;
        const limit = this.getInputData(3) as number;
        const offset = this.getInputData(4) as number;

        try {
            const response = await codebolt.mail.fetchInbox({ agentId, unreadOnly, limit, offset });
            handleMailResponse(this, response, 2, 3, { messages: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
