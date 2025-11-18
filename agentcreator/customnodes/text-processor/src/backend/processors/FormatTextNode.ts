import { FormatTextNodeData } from '../../shared/types';

export class FormatTextNodeHandler {
  static execute(nodeData: FormatTextNodeData, inputData: any[]): string {
    const template = inputData[0] ?? nodeData.template ?? "";
    const values = inputData.slice(1); // Get all remaining inputs as values

    // Validate inputs
    if (typeof template !== 'string') {
      console.warn('FormatTextNode: Invalid template, returning empty string');
      return "";
    }

    // If no input values provided, use properties
    const finalValues = values.length > 0 ? values : (nodeData.values ?? []);

    // Simple template replacement {0}, {1}, {2}, etc.
    let result = template;
    finalValues.forEach((value, index) => {
      const placeholder = `{${index}}`;
      const replacement = String(value !== undefined ? value : "");
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    });

    return result;
  }
}