import { BaseSendConfirmationRequestNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, getArrayInput, getBooleanInput, getStringInput, setNamedOutput } from './utils.js';

export class SendConfirmationRequestNode extends BaseSendConfirmationRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const message = getStringInput(this, 1, 'message');
    if (!message) {
      emitChatFailure(this, 'Confirmation message is required');
      return;
    }

    const buttons = getArrayInput(this, 2, 'buttons', []);
    const withFeedback = getBooleanInput(this, 3, 'withFeedback', false);

    try {
      const response = await codebolt.chat.sendConfirmationRequest(message, buttons, withFeedback);
      emitChatSuccess(this, response);
      setNamedOutput(this, 'selection', response);
    } catch (error) {
      emitChatFailure(this, 'Failed to send confirmation request', error);
    }
  }
}
