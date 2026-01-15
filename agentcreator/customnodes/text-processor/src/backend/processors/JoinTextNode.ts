import { JoinTextNodeData } from '../../shared/types';

export class JoinTextNodeHandler {
  static execute(nodeData: JoinTextNodeData, inputData: any[]): string {
    const strings = inputData[0] ?? nodeData.strings ?? [];
    const separator = inputData[1] ?? nodeData.separator ?? " ";

    // Validate inputs
    if (!Array.isArray(strings)) {
      console.warn('JoinTextNode: Invalid strings input, returning empty string');
      return "";
    }

    if (typeof separator !== 'string') {
      console.warn('JoinTextNode: Invalid separator, using empty string');
      return strings.filter(item => typeof item === 'string').join('');
    }

    // Filter to ensure all elements are strings
    const stringArray = strings.filter(item => typeof item === 'string');

    return stringArray.join(separator);
  }
}