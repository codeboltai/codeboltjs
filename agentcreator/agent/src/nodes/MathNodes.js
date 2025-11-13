import { BaseBypassNode, BaseToNumberNode, BaseRandNode, BaseAbsNode, BaseClampNode } from '@agent-creator/shared-nodes';

// Backend-specific Bypass Node - execution logic only
export class BypassNode extends BaseBypassNode {
  onExecute() {
    const value = this.getInputData(0);
    this.setOutputData(0, value);
    // // console.log(`BypassNode ${this.id}: passing through ${value}`);
  }
}

// Backend-specific ToNumber Node - execution logic only
export class ToNumberNode extends BaseToNumberNode {
  onExecute() {
    const value = this.getInputData(0);
    const number = this.convertToNumber(value);
    this.setOutputData(0, number);
    // // console.log(`ToNumberNode ${this.id}: converted ${value} to ${number}`);
  }
}

// Backend-specific Rand Node - execution logic only
export class RandNode extends BaseRandNode {
  onExecute() {
    const min = this.getInputData(1);
    const max = this.getInputData(2);
    const random = this.generateRandom(min, max);
    this.setOutputData(0, random);
    // // console.log(`RandNode ${this.id}: generated random ${random} between [${min}, ${max}]`);
  }
}

// Backend-specific Abs Node - execution logic only
export class AbsNode extends BaseAbsNode {
  onExecute() {
    const value = this.getInputData(0);
    const abs = this.calculateAbs(value);
    this.setOutputData(0, abs);
    // // console.log(`AbsNode ${this.id}: |${value}| = ${abs}`);
  }
}

// Backend-specific Clamp Node - execution logic only
export class ClampNode extends BaseClampNode {
  onExecute() {
    const value = this.getInputData(0);
    const min = this.getInputData(1);
    const max = this.getInputData(2);
    const clamped = this.calculateClamp(value, min, max);
    this.setOutputData(0, clamped);
    // // console.log(`ClampNode ${this.id}: clamped ${value} to [${min}, ${max}] = ${clamped}`);
  }
}