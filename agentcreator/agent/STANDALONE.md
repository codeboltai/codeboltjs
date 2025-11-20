# Standalone Agent Bundle

This document explains how to build and use the standalone agent bundle that can be moved anywhere without requiring `npm install`.

## Building the Standalone Bundle

```bash
npm run build:standalone
```

This will create:
- `dist/index.cjs` - Single-file agent bundle with all dependencies included
- `dist/data.json` - Sample data file (copied from test/readFileGraph.json)

## Using the Standalone Bundle

### Method 1: Run from dist directory

```bash
cd dist
node index.cjs
```

### Method 2: Move to any location

```bash
# Copy both files to your desired location
cp dist/index.cjs /path/to/your/location/
cp dist/data.json /path/to/your/location/

# Run from the new location
cd /path/to/your/location
node index.cjs
```

### Method 3: Use custom data file

```bash
# Set the agentFlowPath environment variable
agentFlowPath=custom-data.json node index.cjs
```

## What's Included

The standalone bundle (`index.cjs`) includes:
- All agent code from `src/`
- All dependencies from `@codebolt/*` packages
- All node definitions
- Polyfills for CommonJS compatibility
- WebSocket polyfill (falls back if `ws` module not available)

## Requirements

- Node.js 20.0.0 or higher
- No `npm install` required!
- No `node_modules` needed!

## How It Works

The build process:
1. Uses esbuild to bundle all TypeScript code and dependencies into a single CommonJS file
2. Replaces `import.meta.url` references with CommonJS-compatible `__filename`
3. Adds polyfills for WebSocket and other browser APIs
4. Creates an executable file that can run standalone

## Troubleshooting

### "Cannot find module 'data.json'"

Make sure `data.json` is in the same directory as `index.cjs`, or set the `agentFlowPath` environment variable:

```bash
agentFlowPath=/path/to/your/data.json node index.cjs
```

### "WebSocket module not found"

This is normal! The bundle includes a WebSocket polyfill. If you need full WebSocket functionality, install the `ws` module:

```bash
npm install ws
```

## File Size

The standalone bundle is approximately 2 MB, which includes:
- All agent code
- LiteGraph library
- Codebolt SDK
- All node definitions
- Polyfills and utilities
