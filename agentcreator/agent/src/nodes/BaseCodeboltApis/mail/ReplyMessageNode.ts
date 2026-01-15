import { BaseReplyMessageNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { handleMailResponse } from './utils';

export class ReplyMessageNode extends BaseReplyMessageNode {
    async onExecute() {
        const messageId = this.getInputData(1) as string;
        const senderId = this.getInputData(2) as string;
        const senderName = this.getInputData(3) as string;
        const body = this.getInputData(4) as string;

        try {
            const response = await codebolt.mail.replyMessage({ messageId, senderId, senderName, body });
            handleMailResponse(this, response, 2, 3, { newMessageId: 1 });
        } catch (error: any) {
            this.setOutputData(2, false);
            this.setOutputData(3, error.message || String(error));
        }
    }
}
