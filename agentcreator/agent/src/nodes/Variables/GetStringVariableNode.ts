import { BaseGetStringVariableNode } from '@codebolt/agent-shared-nodes';

export class GetStringVariableNode extends BaseGetStringVariableNode {
  onExecute() {
    const value = this.resolveOutputValue();
    this.setOutputData(0, value);
  }
}
