export interface SplitTextNodeData {
  text?: string;
  delimiter?: string;
}

export interface JoinTextNodeData {
  strings?: string[];
  separator?: string;
}

export interface ReplaceTextNodeData {
  text?: string;
  search?: string;
  replace?: string;
  useRegex?: boolean;
}

export interface FormatTextNodeData {
  template?: string;
  values?: any[];
}