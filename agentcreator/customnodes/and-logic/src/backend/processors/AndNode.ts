import { AndNodeData } from '../../shared/types';

export class AndNodeHandler {
  static execute(nodeData: AndNodeData, inputData: any[]): boolean {
    // Get all boolean input values
    const inputValues: boolean[] = [];

    for (const input of inputData) {
      // Treat undefined, null, and non-boolean values as false
      if (input === true) {
        inputValues.push(true);
      } else {
        inputValues.push(false);
      }
    }

    // If no inputs, return false
    if (inputValues.length === 0) {
      return false;
    }

    // Perform logical AND operation
    return inputValues.every(val => val === true);
  }
}