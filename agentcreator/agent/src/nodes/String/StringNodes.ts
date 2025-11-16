import { BaseToStringNode, BaseCompareNode, BaseToUpperCaseNode, BaseContainsNode } from '@agent-creator/shared-nodes';

// Backend-specific ToString Node - execution logic only
export class ToStringNode extends BaseToStringNode {
  onExecute() {
    const value = this.getInputData(0);
    const result = this.convertToString(value);
    this.setOutputData(0, result);
    // // console.log(`ToStringNode ${this.id}: ${value} -> "${result}"`);
  }
}

// Backend-specific Compare Node - execution logic only
export class CompareNode extends BaseCompareNode {
  onExecute() {
    const a = this.getInputData(0);
    const b = this.getInputData(1);
    const caseSensitive = this.properties.case_sensitive as boolean;
    const result = this.compareStrings(a, b, caseSensitive);
    this.setOutputData(0, result);
    // // console.log(`CompareNode ${this.id}: "${a}" == "${b}" (case: ${caseSensitive}) = ${result}`);
  }
}

// Backend-specific ToUpperCase Node - execution logic only
export class ToUpperCaseNode extends BaseToUpperCaseNode {
  onExecute() {
    const value = this.getInputData(0);
    const result = this.toUpperCase(value);
    this.setOutputData(0, result);
    // // console.log(`ToUpperCaseNode ${this.id}: "${value}" -> "${result}"`);
  }
}

// Backend-specific Contains Node - execution logic only
export class ContainsNode extends BaseContainsNode {
  onExecute() {
    const str = this.getInputData(0);
    const substr = this.getInputData(1);
    const caseSensitive = this.properties.case_sensitive as boolean;
    const result = this.containsSubstring(str, substr, caseSensitive);
    this.setOutputData(0, result);
    // // console.log(`ContainsNode ${this.id}: "${str}" contains "${substr}" (case: ${caseSensitive}) = ${result}`);
  }
}