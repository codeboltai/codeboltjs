import { BaseContainsNode } from '@agent-creator/shared-nodes';

// Backend-specific Contains Node - execution logic only
export class ContainsNode extends BaseContainsNode {
  onExecute() {
    const str = this.getInputData(0);
    const substr = this.getInputData(1);
    const caseSensitive = this.properties.case_sensitive;
    const result = this.containsSubstring(str, substr, caseSensitive);
    this.setOutputData(0, result);
    // console.log(`ContainsNode ${this.id}: "${str}" contains "${substr}" (case: ${caseSensitive}) = ${result}`);
  }
}