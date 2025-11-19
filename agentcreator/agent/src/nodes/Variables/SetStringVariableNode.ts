import { BaseSetStringVariableNode } from '@codebolt/agent-shared-nodes';

export class SetStringVariableNode extends BaseSetStringVariableNode {
  onExecute() {
    const incomingValue = this.getInputData(0);
    const storedValue = this.persistValue(incomingValue);
    this.setOutputData(0, storedValue ?? "");
  }
}
