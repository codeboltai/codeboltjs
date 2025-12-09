import { BaseSendMailMessageNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class SendMailMessageNode extends BaseSendMailMessageNode {
    async onExecute() {
        const senderId = this.getInputData(1) as string;
        const senderName = this.getInputData(2) as string;
        const recipients = this.getInputData(3) as string[];
        const body = this.getInputData(4) as string;
        const subject = this.getInputData(5) as string;

        try {
            const response = await codebolt.mail.sendMessage({ senderId, senderName, recipients, body, subject });
            handleMailResponse(this, response, 2, 3, { messageId: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
