import { SplitTextNodeData } from '../../shared/types';

export class SplitTextNodeHandler {
  static execute(nodeData: SplitTextNodeData, inputData: any[]): string[] {
    const text = inputData[0] ?? nodeData.text ?? "";
    const delimiter = inputData[1] ?? nodeData.delimiter ?? " ";

    // Validate inputs
    if (typeof text !== 'string' || typeof delimiter !== 'string') {
      console.warn('SplitTextNode: Invalid inputs, returning empty array');
      return [];
    }

    return text.split(delimiter);
  }
}