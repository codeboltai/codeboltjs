import { BaseReleaseFilesNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class ReleaseFilesNode extends BaseReleaseFilesNode {
    async onExecute() {
        const agentId = this.getInputData(1) as string;
        const paths = this.getInputData(2) as string[];

        try {
            const response = await codebolt.mail.releaseFiles({ agentId, paths });
            // Outputs: released(1), success(2), error(3)
            handleMailResponse(this, response, 2, 3, { released: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
