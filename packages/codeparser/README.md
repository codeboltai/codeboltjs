# @codebolt/codeparser

Code parsing utilities with tree-sitter support for multiple programming languages.

## Features

- Parse source code files across multiple programming languages
- Extract definitions and code structure using tree-sitter parsers
- Support for JavaScript, TypeScript, Python, Rust, Go, Java, C/C++, C#, Ruby, PHP, and Swift
- Tree-sitter WASM binaries for cross-platform compatibility

## Installation

```bash
npm install @codebolt/codeparser
```

## Usage

```typescript
import { parseSourceCodeForDefinitionsTopLevel, parseFile, loadRequiredLanguageParsers } from '@codebolt/codeparser';

// Parse a directory for source code definitions
const definitions = await parseSourceCodeForDefinitionsTopLevel('./src');

// Parse a specific file
const languageParsers = await loadRequiredLanguageParsers(['./src/example.ts']);
const fileDefinitions = await parseFile('./src/example.ts', languageParsers);
```

## Supported Languages

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- Rust (.rs)
- Go (.go)
- Java (.java)
- C (.c, .h)
- C++ (.cpp, .hpp)
- C# (.cs)
- Ruby (.rb)
- PHP (.php)
- Swift (.swift)

## API

### Functions

- `parseSourceCodeForDefinitionsTopLevel(dirPath: string)` - Parse a directory for source code definitions
- `parseFile(filePath: string, languageParsers: LanguageParser)` - Parse a specific file
- `loadRequiredLanguageParsers(filesToParse: string[])` - Load language parsers for specific files
- `listFiles(dirPath: string, recursive: boolean)` - List files in a directory
- `separateFiles(allFiles: string[])` - Separate files into parseable and remaining files

### Types

- `LanguageParser` - Language parser interface
- `ASTNode` - Abstract syntax tree node interface
- `ParserConfig` - Parser configuration interface
