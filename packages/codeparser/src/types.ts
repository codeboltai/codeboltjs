/**
 * TypeScript types for the codeparser package
 */

export interface LanguageParser {
  [key: string]: {
    parser: any;
    query: any;
  };
}

export interface ASTNode {
  /** Type of the AST node */
  type: string;
  /** Start position in the source code */
  start?: number;
  /** End position in the source code */
  end?: number;
  /** Line number where the node starts */
  line?: number;
  /** Column number where the node starts */
  column?: number;
  /** Child nodes */
  children?: ASTNode[];
  /** Node value/content */
  value?: any;
  /** Additional node properties */
  [key: string]: any;
}

/**
 * AST Node type compatible with @codebolt/codeboltjs
 * Uses startPosition/endPosition format with row/column
 */
export interface CodeboltASTNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children: CodeboltASTNode[];
}

export interface ParserConfig {
  language: string;
  options: {
    includeComments?: boolean;
    includeLocations?: boolean;
    tolerant?: boolean;
  };
}

export interface FileParseResult {
  /** File path that was parsed */
  filePath: string;
  /** Parsed content/definitions */
  definitions?: string;
  /** Error message if parsing failed */
  error?: string;
}

export interface ParseOptions {
  /** Maximum number of files to parse */
  maxFiles?: number;
  /** Whether to parse recursively */
  recursive?: boolean;
  /** List of file extensions to include */
  extensions?: string[];
  /** List of directories to ignore */
  ignoreDirectories?: string[];
}
