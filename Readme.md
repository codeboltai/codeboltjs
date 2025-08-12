# CodeBolt JavaScript Monorepo

This monorepo contains all CodeBolt JavaScript packages managed with [Turborepo](https://turbo.build/).

## Packages

- **[@codebolt/codeboltjs](./packages/codeboltjs)** - Main CodeBolt JavaScript SDK
- **[@codebolt/codeboltjs-mcp](./packages/codeboltjs-mcp)** - Model Context Protocol (MCP) server implementation
- **[@codebolt/utils](./packages/codeboltjs-utils)** - Utility functions for document processing
- **[@codebolt/agent](./packages/codeboltagentutils)** - Agent utilities for building AI agents
- **[@codebolt/codeparser](./packages/codeparser)** - Code parsing utilities with tree-sitter support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 10+

### Installation

```bash
npm install
```

### Building

Build all packages:

```bash
npm run build
```

### Development

Start development mode for all packages:

```bash
npm run dev
```

### Testing

Run tests for all packages:

```bash
npm run test
```

### Linting

Run linting for all packages:

```bash
npm run lint
```

## Scripts

- `npm run build` - Build all packages
- `npm run dev` - Start development mode
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run clean` - Clean build artifacts
- `npm run build:docs` - Build documentation

## Architecture

This monorepo uses:

- **Turborepo** for build orchestration and caching
- **TypeScript** for type safety
- **npm workspaces** for dependency management
- **Changesets** for version management and publishing

## Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Build and test: `npm run build && npm run test`
5. Submit a pull request

## License

MIT - see [LICENSE](./LICENSE) for details.
