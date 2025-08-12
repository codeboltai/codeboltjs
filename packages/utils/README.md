# @codebolt/utils

Utility functions for document processing and other common tasks.

## Features

- PDF to text conversion using pdf-parse
- Document processing utilities
- File system helpers
- Error handling for document operations

## Installation

```bash
npm install @codebolt/utils
```

## Usage

```typescript
import { docutils } from '@codebolt/utils';

// Convert PDF to text
const text = await docutils.pdf_to_text('./document.pdf');
console.log(text);
```

## API

### Document Utils

- `docutils.pdf_to_text(pdf_path: string): Promise<string>` - Convert PDF document to text

The `pdf_to_text` function:
- Validates file existence
- Reads PDF files as buffer
- Extracts text content using pdf-parse
- Provides comprehensive error handling
- Returns the extracted text as a string

### Error Handling

The utilities include robust error handling for:
- File not found errors
- PDF parsing errors  
- File system access errors
- Unknown errors with fallback messages

## Dependencies

- `pdf-parse` - PDF parsing library
- `@types/pdf-parse` - TypeScript definitions for pdf-parse
