import { RangeNodeData } from '../../shared/types';

export class RangeNodeHandler {
  static execute(nodeData: RangeNodeData, inputData: any[]): number[] {
    const start = inputData[0] ?? nodeData.start ?? 0;
    const end = inputData[1] ?? nodeData.end ?? 10;
    const step = inputData[2] ?? nodeData.step ?? 1;

    // Validate inputs
    if (typeof start !== 'number' || typeof end !== 'number' || typeof step !== 'number') {
      throw new Error('RangeNode: All inputs must be numbers');
    }

    // Handle invalid step
    if (step === 0) {
      console.warn('RangeNode: Step cannot be zero, returning empty array');
      return [];
    }

    return this.generateRange(start, end, step);
  }

  private static generateRange(start: number, end: number, step: number): number[] {
    const range: number[] = [];

    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        range.push(i);
      }
    } else if (step < 0) {
      for (let i = start; i >= end; i += step) {
        range.push(i);
      }
    }

    return range;
  }
}