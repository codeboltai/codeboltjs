package chattemplates

// This file contains example usage patterns for the chat templates

/*
Example usage in the chat component:

// File read operation
chat.AddFileReadMessage("/path/to/file.go", "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}")

// File write operation - create
chat.AddFileWriteMessage("/path/to/new.js", "console.log('Hello!');", "create")

// File write operation - overwrite
chat.AddFileWriteMessage("/path/to/existing.py", "print('Updated content')", "overwrite")

// File operation - delete
chat.AddFileOperationMessage("delete", "/path/to/old.txt", "File deleted successfully", true, "")

// File operation - move
chat.AddFileOperationMessage("move", "/path/from/old.txt", "File moved successfully", true, "/path/to/new.txt")

// Tool execution - success
chat.AddToolExecutionMessage("bash", "ls -la", "success", "total 16\ndrwxr-xr-x  2 user user 4096 Jan  1 12:00 .\ndrwxr-xr-x 10 user user 4096 Jan  1 12:00 ..", "Listed directory contents")

// Tool execution - error
chat.AddToolExecutionMessage("npm", "install", "error", "npm ERR! code ENOENT\nnpm ERR! errno -2", "Failed to install dependencies")

// Tool execution - running
chat.AddToolExecutionMessage("docker", "build -t app .", "running", "", "Building Docker image...")

// Regular messages still work
chat.AddMessage("user", "Help me debug this issue")
chat.AddMessage("ai", "I'll help you debug the issue. Let me check the logs...")
chat.AddMessage("system", "Connected to development server")

Template types available:
- "user" - User messages
- "ai" - AI assistant messages
- "system" - System notifications
- "error" - Error messages
- "read_file" - File read operations
- "write_file" - File write operations (create, overwrite, append)
- "file_operation" - General file operations (delete, move, copy, rename, mkdir)
- "tool_execution" - Tool/command execution with status

Metadata structure for different template types:

read_file:
{
  "file_path": string // Path to the file that was read
}

write_file:
{
  "file_path": string, // Path to the file that was written
  "operation": string  // "create", "overwrite", "append"
}

file_operation:
{
  "operation": string,    // "delete", "move", "copy", "rename", "mkdir"
  "file_path": string,    // Source file path
  "target_path": string,  // Target path (for move/copy/rename)
  "success": bool         // Whether the operation succeeded
}

tool_execution:
{
  "tool_name": string, // Name of the tool (bash, npm, docker, etc.)
  "command": string,   // Command that was executed
  "status": string,    // "running", "success", "error"
  "output": string     // Command output (stdout/stderr)
}
*/
