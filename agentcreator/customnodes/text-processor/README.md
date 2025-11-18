# Text Processing Plugin

A CodeBolt plugin that provides text manipulation and processing operations for the LiteGraph editor.

## Features

This plugin includes four text processing nodes:

### SplitTextNode (`text/split`)
- **Description**: Split string by delimiter
- **Inputs**:
  - Text (string)
  - Delimiter (string)
- **Output**: Array of strings
- **Icon**: ⧸

### JoinTextNode (`text/join`)
- **Description**: Join array of strings with separator
- **Inputs**:
  - Strings (array)
  - Separator (string)
- **Output**: Result (string)
- **Icon**: ⧹

### ReplaceTextNode (`text/replace`)
- **Description**: Find and replace text operations
- **Inputs**:
  - Text (string)
  - Search (string)
  - Replace (string)
- **Output**: Result (string)
- **Properties**:
  - Use Regex (boolean) - Enable regex search
- **Icon**: ⟶

### FormatTextNode (`text/format`)
- **Description**: Template string formatting
- **Inputs**:
  - Template (string)
  - Value 1 (number,string)
  - Value 2 (number,string)
  - Value 3 (number,string)
- **Output**: Result (string)
- **Icon**: {}

## Installation

This plugin is automatically loaded by the CodeBolt application if placed in the `customnodes/text-processor/` directory.

## Development

### Building the Plugin
```bash
cd agentcreator/customnodes/text-processor
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

### Clean Build
```bash
npm run clean
```

## Usage

After installation, the nodes will be available in the LiteGraph editor under the "Text" category.

### Template Formatting

The FormatTextNode uses simple placeholder syntax `{0}`, `{1}`, `{2}`, etc.:

- Template: `"Hello {0}, the answer is {1}"`
- Value 1: `"World"`
- Value 2: `42`
- Result: `"Hello World, the answer is 42"`

## License

MIT License