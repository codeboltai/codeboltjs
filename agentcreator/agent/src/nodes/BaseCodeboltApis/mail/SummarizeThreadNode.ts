import { BaseSummarizeThreadNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class SummarizeThreadNode extends BaseSummarizeThreadNode {
    async onExecute() {
        const threadId = this.getInputData(1) as string;
        const maxMessages = this.getInputData(2) as number;

        try {
            const response = await codebolt.mail.summarizeThread({ threadId, maxMessages });
            handleMailResponse(this, response, 2, 3, { summary: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
