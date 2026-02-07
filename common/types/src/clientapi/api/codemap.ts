// Codemap API types

export interface Codemap {
  id: string;
  filePath: string;
  symbols: CodemapSymbol[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CodemapSymbol {
  name: string;
  kind: string;
  range: { start: number; end: number };
  children?: CodemapSymbol[];
}

export interface CodemapByPathParams {
  path: string;
}

export interface GenerateCodemapRequest {
  path: string;
  force?: boolean;
}
