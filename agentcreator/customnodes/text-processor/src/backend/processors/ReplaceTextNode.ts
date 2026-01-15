import { ReplaceTextNodeData } from '../../shared/types';

export class ReplaceTextNodeHandler {
  static execute(nodeData: ReplaceTextNodeData, inputData: any[]): string {
    const text = inputData[0] ?? nodeData.text ?? "";
    const search = inputData[1] ?? nodeData.search ?? "";
    const replace = inputData[2] ?? nodeData.replace ?? "";
    const useRegex = nodeData.useRegex ?? false;

    // Validate inputs
    if (typeof text !== 'string' || typeof search !== 'string' || typeof replace !== 'string') {
      console.warn('ReplaceTextNode: Invalid inputs, returning original text');
      return text;
    }

    if (search === "") {
      return text; // Nothing to replace
    }

    let result: string;
    if (useRegex) {
      try {
        const flags = 'g'; // Global replacement
        const regex = new RegExp(search, flags);
        result = text.replace(regex, replace);
      } catch (error) {
        console.error('ReplaceTextNode: Invalid regex pattern:', error);
        result = text; // Return original text if regex is invalid
      }
    } else {
      // Escape special regex characters for literal search
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = text.replace(new RegExp(escapedSearch, 'g'), replace);
    }

    return result;
  }
}