import { PowerNodeData } from '../../shared/types';

export class PowerNodeHandler {
  static execute(nodeData: PowerNodeData, inputData: any[]): number {
    const base = inputData[0] ?? nodeData.base ?? 2;
    const exponent = inputData[1] ?? nodeData.exponent ?? 3;

    // Validate inputs
    if (typeof base !== 'number' || typeof exponent !== 'number') {
      throw new Error('PowerNode: Both inputs must be numbers');
    }

    return Math.pow(base, exponent);
  }
}