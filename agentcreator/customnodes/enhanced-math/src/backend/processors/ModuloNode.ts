import { ModuloNodeData } from '../../shared/types';

export class ModuloNodeHandler {
  static execute(nodeData: ModuloNodeData, inputData: any[]): number {
    const dividend = inputData[0] ?? nodeData.dividend ?? 10;
    const divisor = inputData[1] ?? nodeData.divisor ?? 3;

    // Validate inputs
    if (typeof dividend !== 'number' || typeof divisor !== 'number') {
      throw new Error('ModuloNode: Both inputs must be numbers');
    }

    // Handle division by zero
    if (divisor === 0) {
      console.warn('ModuloNode: Division by zero, returning 0');
      return 0;
    }

    return dividend % divisor;
  }
}