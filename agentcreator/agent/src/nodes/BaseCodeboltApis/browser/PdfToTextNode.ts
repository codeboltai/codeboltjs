import { BasePdfToTextNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class PdfToTextNode extends BasePdfToTextNode {
    constructor() { super(); }

    async onExecute() {
        try {
            codebolt.browser.pdfToText();
            this.setOutputData(1, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('PdfToTextNode error:', error);
            this.setOutputData(1, false);
        }
    }
}
