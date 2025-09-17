# Project Information in WebSocket Connections

This document demonstrates how the updated connection manager and WebSocket server handle project information when apps connect.

## Changes Made

### 1. Updated `ClientConnection` Interface
Added `currentProject` field to store project information:
```typescript
export interface ProjectInfo {
  path: string;
  name?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  type: 'app' | 'agent' | 'client';
  connectedAt: Date;
  currentProject?: ProjectInfo;  // New field
}
```

### 2. Updated Connection Parameters
Extended `ConnectionParams` to include project information:
```typescript
export type ConnectionParams = {
  agentId?: string;
  parentId?: string;
  clientType?: string;
  appId?: string;
  currentProject?: string;    // New field
  projectName?: string;       // New field
  projectType?: string;       // New field
};
```

### 3. Enhanced Connection Manager
Added methods to handle project information:
- `registerConnection()` - Now accepts project information
- `updateConnectionProject()` - Update project for existing connection
- `getConnectionProject()` - Get project for a connection
- `getAllConnectionsWithProjects()` - Get all connections with their projects
- `getConnectionsByProject()` - Find connections by project path

### 4. Updated WebSocket Server
Enhanced to parse and handle project information:
- `parseConnectionParams()` - Extracts project parameters from URL
- `createProjectInfo()` - Creates ProjectInfo object from parameters
- Registration methods now pass project information to connection manager

## Usage Examples

### App Connection with Project Information
When an app connects, it can include project information in the WebSocket URL:

```
ws://localhost:3001/?clientType=app&appId=my-app&currentProject=/path/to/project&projectName=MyProject&projectType=node
```

### Registration Response
The server will respond with registration confirmation including project info:
```json
{
  "type": "registered",
  "connectionId": "my-app",
  "connectionType": "app",
  "message": "Successfully auto-registered as app",
  "registrationType": "auto",
  "currentProject": {
    "path": "/path/to/project",
    "name": "MyProject",
    "type": "node",
    "metadata": {}
  }
}
```

### Agent Connection with Project Information
Agents can also include project information when connecting:

```
ws://localhost:3001/?agentId=agent-123&parentId=my-app&currentProject=/path/to/project&projectName=MyProject
```

## API Methods

### Get Project Information
```typescript
const connectionManager = ConnectionManager.getInstance();
const projectInfo = connectionManager.getConnectionProject('my-app');
```

### Update Project Information
```typescript
const newProjectInfo: ProjectInfo = {
  path: '/new/project/path',
  name: 'New Project',
  type: 'react',
  metadata: { framework: 'vite' }
};
connectionManager.updateConnectionProject('my-app', newProjectInfo);
```

### Find Connections by Project
```typescript
const connections = connectionManager.getConnectionsByProject('/path/to/project');
```

### Get All Connections with Projects
```typescript
const connectionsWithProjects = connectionManager.getAllConnectionsWithProjects();
```

## Benefits

1. **Project Context**: Each connection now has context about which project it's working with
2. **Multi-Project Support**: Can handle multiple projects simultaneously
3. **Project-Based Routing**: Can route messages based on project information
4. **Enhanced Logging**: Connection logs now include project information
5. **Flexible Metadata**: Project metadata field allows storing additional project-specific information

## Implementation Notes

- Project information is optional - connections can still work without it
- Project path is the only required field in ProjectInfo
- All existing functionality remains unchanged
- The changes are backward compatible
