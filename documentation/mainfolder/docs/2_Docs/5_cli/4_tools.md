# MCP Tools Commands

This section covers all commands related to creating, managing, and using MCP (Model Context Protocol) tools.

## Overview

MCP Tools commands allow you to develop, publish, and manage tools that follow the Model Context Protocol. These tools can be used by AI agents to extend their capabilities and interact with external systems.

## Commands

### Create Tool
Create a new Codebolt Tool (MCP tool).

```bash
npx codebolt-cli createtool [options]
```

**Options:**
- `-n, --name <name>`: Name of the Tool
- `-i, --id <unique-id>`: Unique identifier for the tool (no spaces)
- `-d, --description <description>`: Description of the tool
- `-p, --parameters <json>`: Tool parameters in JSON format (e.g., `{"param1": "value1"}`)

**Examples:**
```bash
# Create tool with all options
npx codebolt-cli createtool --name "My Tool" --id my-tool --description "A useful tool" --parameters '{"param1": "value1"}'

# Interactive creation
npx codebolt-cli createtool
```

**What it does:**
- Creates a new MCP tool project structure
- Generates tool configuration files
- Sets up package.json with MCP dependencies
- Creates basic tool implementation

### Publish Tool
Publish an MCP tool to the registry.

```bash
npx codebolt-cli publishtool [folderPath]
```

**Description:** Publish a MCP tool to the registry.

**Examples:**
```bash
# Publish tool in current directory
npx codebolt-cli publishtool

# Publish tool from specific folder
npx codebolt-cli publishtool ./my-tool-folder
```

**What it does:**
- Validates MCP tool implementation
- Packages the tool for distribution
- Uploads to the Codebolt registry
- Makes the tool available for agents

### List Tools
Display all MCP tools published by the current user.

```bash
npx codebolt-cli listtools
```

**Description:** List all the MCP tools published by you.

**Output:** Shows tool names, IDs, descriptions, and publication dates.

### Pull Tool
Pull the latest MCP tool configuration from the server.

```bash
npx codebolt-cli pulltool [workingDir]
```

**Description:** Pull the latest MCP tool configuration from server.

**Examples:**
```bash
# Pull tool in current directory
npx codebolt-cli pulltool

# Pull tool from specific directory
npx codebolt-cli pulltool ./my-tool
```

**What it does:**
- Downloads latest tool configuration
- Updates local implementation files
- Syncs with remote changes

### Run Tool
Run a specified tool with a required file.

```bash
npx codebolt-cli runtool <command> <file>
```

**Description:** Run a specified tool with a required file.

**Examples:**
```bash
npx codebolt-cli runtool process data.json
npx codebolt-cli runtool analyze report.txt
npx codebolt-cli runtool validate config.yaml
```

**What it does:**
- Loads the specified tool
- Executes the tool with provided parameters
- Returns tool output

### Inspect Tool
Inspect a server file using the MCP inspector.

```bash
npx codebolt-cli inspecttool <file>
```

**Description:** Inspect a server file using the Model Context Protocol inspector.

**Examples:**
```bash
npx codebolt-cli inspecttool ./server.js
npx codebolt-cli inspecttool ./tool-handler.js
npx codebolt-cli inspecttool ./index.js
```

**What it does:**
- Analyzes MCP tool implementation
- Validates protocol compliance
- Shows available functions and schemas
- Identifies potential issues

## MCP Tool Project Structure

When you create an MCP tool, the following structure is generated:

```bash
my-tool/
├── codebolttool.yaml  # Tool configuration
├── index.js          # Main tool implementation
├── package.json      # Dependencies
└── README.md        # Tool documentation
```

## MCP Protocol Basics

MCP tools follow the Model Context Protocol specification:

- **Functions**: Define what the tool can do
- **Schemas**: Define input/output data structures
- **Resources**: Define external data sources
- **Prompts**: Define user interaction patterns

## Best Practices

1. **Unique IDs**: Use descriptive, unique identifiers (no spaces)
2. **Clear Descriptions**: Provide detailed tool descriptions
3. **Parameter Validation**: Validate all input parameters
4. **Error Handling**: Implement proper error handling
5. **Testing**: Test tools thoroughly before publishing
6. **Documentation**: Include clear usage examples

## Common MCP Tool Types

- **Data Processing**: Tools for analyzing and transforming data
- **API Integration**: Tools for connecting to external services
- **File Operations**: Tools for reading/writing files
- **System Commands**: Tools for executing system operations
- **Database Access**: Tools for database operations

## Troubleshooting

- **Inspection Issues**: Ensure MCP inspector package is installed
- **Publish Issues**: Validate tool implementation and configuration
- **Run Issues**: Check parameter format and file paths
- **Protocol Issues**: Verify MCP compliance

