// Editor API types

export interface EditorTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: EditorTreeNode[];
}

export interface EditorConfig {
  theme?: string;
  fontSize?: number;
  tabSize?: number;
  wordWrap?: boolean;
  [key: string]: unknown;
}
