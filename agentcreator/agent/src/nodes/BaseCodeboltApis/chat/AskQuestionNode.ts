import { BaseAskQuestionNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, getArrayInput, getBooleanInput, getStringInput, setNamedOutput } from './utils';

export class AskQuestionNode extends BaseAskQuestionNode {
  constructor() {
    super();
  }

  async onExecute() {
    const question = getStringInput(this, 1, 'question');
    if (!question) {
      emitChatFailure(this, 'Question text is required');
      return;
    }

    const buttons = getArrayInput(this, 2, 'buttons', []);
    const withFeedback = getBooleanInput(this, 3, 'withFeedback', false);

    try {
      const answer = await codebolt.chat.askQuestion(question, buttons, withFeedback);
      emitChatSuccess(this, answer);
      setNamedOutput(this, 'answer', answer);
    } catch (error) {
      emitChatFailure(this, 'Failed to ask question', error);
    }
  }
}
