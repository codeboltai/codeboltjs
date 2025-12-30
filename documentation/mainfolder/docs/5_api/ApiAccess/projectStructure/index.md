---
sidebar_position: 1
title: Project Structure Module
---

# Project Structure Module

The Project Structure module provides comprehensive tools for managing project metadata, packages, API routes, database tables, dependencies, and more. This is essential for agents that need to understand and modify project organization.

## Overview

The module manages:
- **Workspace Metadata** - Project-level information
- **Packages** - Logical groupings (frontend, backend, etc.)
- **API Routes** - REST endpoints
- **Database Tables** - Schema definitions
- **Dependencies** - Package dependencies
- **Run Commands** - Build/dev scripts
- **UI Routes** - Frontend routes
- **Deployment Configs** - Deployment settings
- **Git Info** - Repository information
- **Design Guidelines** - Style/design tokens

## Quick Start

```typescript
import codebolt from '@codebolt/codeboltjs';

// Get project metadata
const metadata = await codebolt.projectStructure.getMetadata();

// Create a new package
const pkg = await codebolt.projectStructure.createPackage({
  name: 'api-server',
  path: 'packages/api',
  type: 'backend',
  description: 'REST API server'
});

// Add an API route
await codebolt.projectStructure.addRoute(pkg.package.id, {
  path: '/api/users',
  method: 'GET',
  description: 'List all users',
  handler: 'getUsersHandler'
});

// Add a dependency
await codebolt.projectStructure.addDependency(pkg.package.id, {
  name: 'express',
  version: '^4.18.0',
  type: 'runtime'
});
```

## Available Methods

### Metadata Operations
| Method | Description |
|--------|-------------|
| `getMetadata()` | Get complete project metadata |
| `updateMetadata(updates)` | Update workspace metadata |

### Package Operations
| Method | Description |
|--------|-------------|
| `getPackages()` | List all packages |
| `getPackage(packageId)` | Get a specific package |
| `createPackage(data)` | Create a new package |
| `updatePackage(packageId, updates)` | Update a package |
| `deletePackage(packageId)` | Delete a package |

### API Route Operations
| Method | Description |
|--------|-------------|
| `addRoute(packageId, route)` | Add an API route |
| `updateRoute(packageId, routeId, updates)` | Update a route |
| `deleteRoute(packageId, routeId)` | Delete a route |

### Database Table Operations
| Method | Description |
|--------|-------------|
| `addTable(packageId, table)` | Add a database table |
| `updateTable(packageId, tableId, updates)` | Update a table |
| `deleteTable(packageId, tableId)` | Delete a table |

### Dependency Operations
| Method | Description |
|--------|-------------|
| `addDependency(packageId, dependency)` | Add a dependency |
| `updateDependency(packageId, dependencyId, updates)` | Update a dependency |
| `deleteDependency(packageId, dependencyId)` | Delete a dependency |

### Run Command Operations
| Method | Description |
|--------|-------------|
| `addCommand(packageId, command)` | Add a run command |
| `updateCommand(packageId, commandId, updates)` | Update a command |
| `deleteCommand(packageId, commandId)` | Delete a command |

### UI Route Operations
| Method | Description |
|--------|-------------|
| `addUiRoute(packageId, route)` | Add a UI route |
| `updateUiRoute(packageId, routeId, updates)` | Update a UI route |
| `deleteUiRoute(packageId, routeId)` | Delete a UI route |

### Deployment & Configuration
| Method | Description |
|--------|-------------|
| `addDeployment(packageId, config)` | Add deployment config |
| `updateDeployment(packageId, configId, updates)` | Update deployment |
| `deleteDeployment(packageId, configId)` | Delete deployment |
| `updateGit(gitInfo)` | Update git information |
| `updateDesignGuidelines(packageId, guidelines)` | Update design guidelines |
| `updateFrontendFramework(packageId, framework)` | Update framework info |

## Common Use Cases

### Document Project Architecture
```typescript
// Get full project structure
const meta = await codebolt.projectStructure.getMetadata();
console.log(`Project: ${meta.metadata.name}`);
console.log(`Packages: ${meta.metadata.packages.length}`);

for (const pkg of meta.metadata.packages) {
  console.log(`- ${pkg.name} (${pkg.type}): ${pkg.path}`);
}
```

### Define API Endpoints
```typescript
const routes = [
  { path: '/api/users', method: 'GET', description: 'List users' },
  { path: '/api/users', method: 'POST', description: 'Create user' },
  { path: '/api/users/:id', method: 'GET', description: 'Get user' },
  { path: '/api/users/:id', method: 'PUT', description: 'Update user' },
  { path: '/api/users/:id', method: 'DELETE', description: 'Delete user' }
];

for (const route of routes) {
  await codebolt.projectStructure.addRoute(packageId, route);
}
```

### Manage Dependencies
```typescript
// Add multiple dependencies
const deps = [
  { name: 'react', version: '^18.2.0', type: 'runtime' },
  { name: 'typescript', version: '^5.0.0', type: 'dev' },
  { name: 'vitest', version: '^0.34.0', type: 'dev' }
];

for (const dep of deps) {
  await codebolt.projectStructure.addDependency(packageId, dep);
}
```
