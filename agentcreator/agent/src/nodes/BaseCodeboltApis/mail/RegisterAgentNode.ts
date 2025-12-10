import { BaseRegisterAgentNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';
import crypto from 'crypto';

export class RegisterAgentNode extends BaseRegisterAgentNode {
    async onExecute() {
        const name = this.getInputData(1) as string;
        const program = this.getInputData(2) as string;
        const model = this.getInputData(3) as string;

        try {
            const response = await codebolt.mail.registerAgent({ id: crypto.randomUUID(), name, program, model });
            handleMailResponse(this, response, 2, 3, { agentId: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
