// String Nodes - Base implementations for shared functionality
export { BaseToStringNode } from './BaseToStringNode';
export { BaseCompareNode } from './BaseCompareNode';
export { BaseToUpperCaseNode } from './BaseToUpperCaseNode';
export { BaseContainsNode } from './BaseContainsNode';
export { BaseConcatenateNode } from './BaseConcatenateNode';
export { BaseSplitNode } from './BaseSplitNode';
export { BaseStringToTableNode } from './BaseStringToTableNode';
export { BaseToFixedNode } from './BaseToFixedNode';

// Array of all string node classes for easy registration
export const StringNodes = [
  () => import('./BaseToStringNode'),
  () => import('./BaseCompareNode'),
  () => import('./BaseToUpperCaseNode'),
  () => import('./BaseContainsNode'),
  () => import('./BaseConcatenateNode'),
  () => import('./BaseSplitNode'),
  () => import('./BaseStringToTableNode'),
  () => import('./BaseToFixedNode')
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