# Tools Directory

This directory contains the implementation of all the tools used by the Codebolt agent.

## Tool Files

Each tool is implemented in its own file with the following structure:
- Tool invocation class that handles execution
- Tool class that defines the interface and validation
- Export of both classes

## Available Tools

- `read-file.ts` - Reads content from a single file
- `write-file.ts` - Writes content to a file
- `list-files.ts` - Lists files in a directory
- `search-files.ts` - Searches for content within files
- `read-many-files.ts` - Reads content from multiple files
- `glob.ts` - Finds files matching glob patterns
- `grep.ts` - Searches for patterns within file contents

## Usage

Tools are registered with the ToolRegistry and can be executed through the StandaloneToolsFramework.