# Todo API Usage Examples

The Todo API allows you to access todo data from a `todo.json` file in a project directory. The project path can be specified in several ways.

## API Endpoints

All todo endpoints are available under the `/todos` path:

- `GET /todos/` - Get all todos
- `GET /todos/threads` - Get all thread IDs
- `GET /todos/thread/:threadId` - Get todos for a specific thread
- `GET /todos/health` - Health check endpoint

## Specifying Project Path

The project path can be specified in the following ways:

1. **Query Parameter**: Add `?projectPath=/path/to/project` to any endpoint
2. **Agent Parameters**: Use `?agentType=local-path&agentDetail=/path/to/project` 
3. **Default**: If no path is specified, the current working directory is used

## Example Usage

### Get all todos with explicit project path:
```bash
curl "http://localhost:3001/todos/?projectPath=/Users/username/my-project"
```

### Get todos for a specific thread:
```bash
curl "http://localhost:3001/todos/thread/thread_1760463832527_s4qx4r7rj?projectPath=/Users/username/my-project"
```

### Get all thread IDs:
```bash
curl "http://localhost:3001/todos/threads?projectPath=/Users/username/my-project"
```

### Using agent parameters:
```bash
curl "http://localhost:3001/todos/?agentType=local-path&agentDetail=/Users/username/my-project"
```

## Response Format

All endpoints return JSON responses with a consistent format:

```json
{
  "success": true,
  "data": { ... }
}
```

In case of errors:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Example Response

Getting all todos:

```json
{
  "success": true,
  "todos": {
    "thread_1760463832527_s4qx4r7rj": {
      "id": "thread_1760463832527_s4qx4r7rj",
      "toDos": [
        {
          "id": "6d742997-be1f-41ce-9359-657b028348d5",
          "title": "Analyze project requirements and plan system architecture",
          "status": "completed",
          "createdAt": "2025-10-15T04:20:01.198Z",
          "priority": "medium",
          "tags": [],
          "updatedAt": "2025-10-15T04:20:01.198Z"
        }
      ]
    }
  }
}
```