// String Nodes - Base implementations for shared functionality
import { BaseToStringNode } from './BaseToStringNode';
import { BaseCompareNode } from './BaseCompareNode';
import { BaseToUpperCaseNode } from './BaseToUpperCaseNode';
import { BaseContainsNode } from './BaseContainsNode';
import { BaseConcatenateNode } from './BaseConcatenateNode';
import { BaseSplitNode } from './BaseSplitNode';
import { BaseStringToTableNode } from './BaseStringToTableNode';
import { BaseToFixedNode } from './BaseToFixedNode';

// Export all string node classes
export { BaseToStringNode };
export { BaseCompareNode };
export { BaseToUpperCaseNode };
export { BaseContainsNode };
export { BaseConcatenateNode };
export { BaseSplitNode };
export { BaseStringToTableNode };
export { BaseToFixedNode };

// Array of all string node classes for easy registration
export const StringNodes = [
  BaseToStringNode,
  BaseCompareNode,
  BaseToUpperCaseNode,
  BaseContainsNode,
  BaseConcatenateNode,
  BaseSplitNode,
  BaseStringToTableNode,
  BaseToFixedNode
];

// String node types for registration
export const StringNodeTypes = [
  'string/toString',
  'string/compare',
  'string/toUpperCase',
  'string/contains',
  'string/concatenate',
  'string/split',
  'string/stringToTable',
  'string/toFixed'
];