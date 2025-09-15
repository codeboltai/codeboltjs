# Gemini Agent Configuration Guide

## Table of Contents

- [Overview](#overview)
- [Agent Configuration (YAML)](#agent-configuration-yaml)
- [TypeScript Configuration](#typescript-configuration)
- [Build Configuration](#build-configuration)
- [Environment Variables](#environment-variables)
- [LLM Configuration](#llm-configuration)
- [Tool Configuration](#tool-configuration)
- [Performance Tuning](#performance-tuning)
- [Security Configuration](#security-configuration)
- [Deployment Configuration](#deployment-configuration)

## Overview

The Gemini agent uses multiple configuration files and settings to customize its behavior, performance, and integration with the CodeBolt platform. This guide covers all configuration options available.

## Agent Configuration (YAML)

The main agent configuration is defined in `codeboltagent.yaml`:

### Basic Information

```yaml
title: geminiagent
unique_id: geminiagent
initial_message: Hello! I'm your advanced AI developer. How can I assist you today?
description: Advanced Gemini-powered CodeBolt Agent
longDescription: >
  A sophisticated AI agent designed for the CodeBolt platform, offering 
  intelligent code assistance, file operations, and workflow automation 
  using Google's Gemini language model.
```

### Agent Metadata

```yaml
metadata:
  # Agent routing configuration
  agent_routing:
    worksonblankcode: true          # Can work on new projects
    worksonexistingcode: true       # Can work on existing codebases
    supportedlanguages:             # Programming languages supported
      - typescript
      - javascript
      - python
      - java
      - go
      - rust
      - html
      - css
      - json
    supportedframeworks:            # Frameworks supported
      - react
      - vue
      - angular
      - express
      - next
      - nuxt
      - fastapi
      - django
      - spring
      - all                         # Indicates broad framework support
```

### LLM Configuration

```yaml
metadata:
  # Default LLM settings
  defaultagentllm:
    strict: true                    # Enforce model order
    modelorder:                     # Preferred model order
      - gemini-1.5-pro
      - gemini-pro
      - gpt-4-turbo
      - claude-3-opus
```

### Specialized LLM Roles

```yaml
metadata:
  llm_role:
    # Documentation-specific LLM
    - name: documentationllm
      description: >-
        LLM optimized for documentation tasks including code comments,
        README files, API documentation, and technical writing.
      strict: true
      modelorder:
        - gemini-1.5-pro
        - gpt-4-turbo
        - claude-3-opus
        - group.documentationmodels
    
    # Testing-specific LLM
    - name: testingllm
      description: >-
        LLM specialized in writing unit tests, integration tests,
        and test automation scripts.
      strict: true
      modelorder:
        - gemini-1.5-pro
        - gpt-4-turbo
        - claude-3-opus
        - group.testingmodels
    
    # Action execution LLM
    - name: actionllm
      description: >-
        LLM for executing actions, tool calls, and complex
        multi-step operations.
      strict: true
      modelorder:
        - gemini-1.5-pro
        - gemini-pro
        - gpt-4-turbo
        - group.actionmodels
```

### SDLC Integration

```yaml
metadata:
  # Software Development Lifecycle steps
  sdlc_steps_managed:
    - name: codegeneration
      example_instructions:
        - Generate a new React component
        - Create a REST API endpoint
        - Implement a database model
    
    - name: testing
      example_instructions:
        - Write unit tests for this function
        - Create integration tests
        - Generate test data
    
    - name: documentation
      example_instructions:
        - Document this API
        - Write inline comments
        - Create user documentation
    
    - name: debugging
      example_instructions:
        - Fix this bug
        - Analyze error logs
        - Optimize performance
```

### Agent Actions

```yaml
actions:
  - name: Execute
    description: Executes the given task with full automation
    detailDescription: >
      Processes user requests through the complete agent pipeline
      including message modification, processing, tool execution,
      and response generation.
    actionPrompt: Please execute this task
    
  - name: Analyze
    description: Analyzes code or project structure
    detailDescription: >
      Performs static analysis, code review, and provides
      insights about code quality and structure.
    actionPrompt: Please analyze this code
    
  - name: Generate
    description: Generates code, documentation, or tests
    detailDescription: >
      Creates new code files, documentation, test cases,
      or other development artifacts.
    actionPrompt: Please generate this content
```

### Agent Metadata

```yaml
# Agent information
author: codebolt
version: 1.0.0
tags:
  - ai
  - gemini
  - development
  - automation
  - codegen

# Visual configuration
avatarSrc: https://example.com/avatar.png
avatarFallback: GA

# Additional metadata
metadata:
  capabilities:
    - file_operations
    - code_generation
    - documentation
    - testing
    - debugging
    - project_analysis
  
  performance:
    max_iterations: 10
    max_token_limit: 128000
    timeout_seconds: 300
```

## TypeScript Configuration

The agent uses strict TypeScript configuration in `tsconfig.json`:

### Compiler Options

```json
{
  "compilerOptions": {
    // Target and module system
    "target": "ES2020",
    "module": "Node16",
    "moduleResolution": "node16",
    "lib": ["ES2020"],
    
    // Output configuration
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    
    // Type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // Module resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    // Experimental features
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    
    // Type roots
    "typeRoots": ["node_modules/@types"]
  },
  
  "include": [
    "src/**/*.ts"
  ],
  
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### Custom Type Declarations

Create custom type declarations in `src/types/`:

```typescript
// src/types/agent.d.ts
declare module '@codebolt/agent' {
  interface AgentConfig {
    maxIterations?: number;
    enableLogging?: boolean;
    timeout?: number;
  }
  
  interface ToolConfig {
    maxRetries?: number;
    timeout?: number;
    enableLogging?: boolean;
  }
}

// src/types/gemini.d.ts
declare module 'gemini-api' {
  interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }
}
```

## Build Configuration

The agent uses esbuild for fast compilation in `build.mjs`:

### Basic Build Configuration

```javascript
import esbuild from 'esbuild';

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'cjs',
  
  // External dependencies (not bundled)
  external: [
    'bufferutil',
    'utf-8-validate',
    '@codebolt/codeboltjs',
    '@codebolt/agent'
  ],
  
  // Source map configuration
  sourcemap: true,
  
  // Minification (for production)
  minify: process.env.NODE_ENV === 'production',
  
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.AGENT_VERSION': JSON.stringify(process.env.npm_package_version)
  }
};

// Development vs Production builds
if (process.env.NODE_ENV === 'development') {
  // Development-specific configuration
  config.sourcemap = 'inline';
  config.keepNames = true;
} else {
  // Production-specific configuration
  config.minify = true;
  config.treeShaking = true;
  config.dropLabels = ['DEV'];
}

esbuild.build(config).catch(() => process.exit(1));
```

### Advanced Build Options

```javascript
// build-advanced.mjs
import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  format: 'cjs',
  
  // Plugins
  plugins: [
    copy({
      assets: [
        { from: './codeboltagent.yaml', to: './codeboltagent.yaml' },
        { from: './package.json', to: './package.json' }
      ]
    })
  ],
  
  // Code splitting
  splitting: false,
  
  // Chunk names
  chunkNames: 'chunks/[name]-[hash]',
  
  // Asset names
  assetNames: 'assets/[name]-[hash]',
  
  // Metafile for analysis
  metafile: true,
  
  // Watch mode for development
  watch: process.env.NODE_ENV === 'development' ? {
    onRebuild(error, result) {
      if (error) console.error('Build failed:', error);
      else console.log('Build succeeded:', result);
    }
  } : false
}).then(result => {
  if (result.metafile) {
    console.log('Build analysis available in metafile');
  }
});
```

## Environment Variables

Configure the agent using environment variables:

### Core Environment Variables

```bash
# Agent configuration
AGENT_NAME=geminiagent
AGENT_VERSION=1.0.0
AGENT_DEBUG=true

# LLM configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# Performance configuration
MAX_ITERATIONS=10
MAX_RETRIES=3
TIMEOUT_SECONDS=300
ENABLE_COMPRESSION=true

# Logging configuration
LOG_LEVEL=info
LOG_FORMAT=json
LOG_DIRECTORY=./logs

# Security configuration
ENABLE_SANDBOX=true
ALLOWED_DOMAINS=example.com,api.example.com
```

### Development Environment

```bash
# .env.development
NODE_ENV=development
AGENT_DEBUG=true
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
WATCH_FILES=true
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
AGENT_DEBUG=false
LOG_LEVEL=warn
ENABLE_TELEMETRY=true
OPTIMIZE_PERFORMANCE=true
```

### Docker Environment

```dockerfile
# Dockerfile environment variables
ENV NODE_ENV=production
ENV AGENT_NAME=geminiagent
ENV LOG_LEVEL=info
ENV MAX_ITERATIONS=10
ENV TIMEOUT_SECONDS=300
```

## LLM Configuration

### Gemini-specific Configuration

```typescript
interface GeminiConfig {
  // Model configuration
  model: string;                    // gemini-pro, gemini-1.5-pro
  temperature: number;              // 0.0 - 1.0 (creativity)
  maxTokens: number;               // Maximum output tokens
  topP?: number;                   // Nucleus sampling (0.0 - 1.0)
  topK?: number;                   // Top-K sampling
  
  // Safety settings
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
  
  // Generation configuration
  candidateCount?: number;          // Number of candidates to generate
  stopSequences?: string[];         // Stop generation at these sequences
  
  // Performance settings
  timeout?: number;                 // Request timeout
  retryAttempts?: number;          // Retry failed requests
  retryDelay?: number;             // Delay between retries
}
```

### Model Selection Strategy

```typescript
const modelSelectionConfig = {
  // Primary models (in order of preference)
  primary: [
    'gemini-1.5-pro',
    'gemini-pro'
  ],
  
  // Fallback models
  fallback: [
    'gpt-4-turbo',
    'claude-3-opus',
    'gpt-3.5-turbo'
  ],
  
  // Task-specific models
  taskSpecific: {
    documentation: ['gemini-1.5-pro', 'gpt-4-turbo'],
    testing: ['gemini-pro', 'gpt-4-turbo'],
    codeGeneration: ['gemini-1.5-pro', 'gemini-pro'],
    debugging: ['gemini-1.5-pro', 'gpt-4-turbo']
  },
  
  // Model capabilities
  capabilities: {
    'gemini-1.5-pro': {
      maxTokens: 128000,
      supportsImages: true,
      supportsCode: true,
      languages: ['javascript', 'typescript', 'python', 'java']
    },
    'gemini-pro': {
      maxTokens: 32000,
      supportsImages: true,
      supportsCode: true,
      languages: ['javascript', 'typescript', 'python']
    }
  }
};
```

## Tool Configuration

### Tool Registration

```typescript
// Tool configuration
const toolConfig = {
  // Built-in tools
  builtinTools: {
    fileOperations: {
      enabled: true,
      maxFileSize: 10 * 1024 * 1024,  // 10MB
      allowedExtensions: ['.js', '.ts', '.json', '.md'],
      restrictedPaths: ['node_modules', '.git']
    },
    
    codeAnalysis: {
      enabled: true,
      supportedLanguages: ['typescript', 'javascript'],
      maxFileSize: 5 * 1024 * 1024
    }
  },
  
  // Custom tools
  customTools: {
    enabled: true,
    toolDirectory: './tools',
    autoLoad: true
  },
  
  // Tool execution
  execution: {
    maxRetries: 3,
    timeout: 30000,
    concurrent: false,
    enableLogging: true
  }
};
```

### Tool Security Configuration

```typescript
const toolSecurityConfig = {
  // Sandbox configuration
  sandbox: {
    enabled: true,
    allowedCommands: ['node', 'npm', 'git'],
    restrictedCommands: ['rm', 'sudo', 'chmod'],
    workingDirectory: process.cwd(),
    timeout: 30000
  },
  
  // File access control
  fileAccess: {
    allowedPaths: [
      './src',
      './docs',
      './tests'
    ],
    restrictedPaths: [
      '/etc',
      '/usr',
      '/var',
      'node_modules'
    ],
    maxFileSize: 10 * 1024 * 1024
  },
  
  // Network access control
  networkAccess: {
    enabled: true,
    allowedDomains: [
      'api.gemini.google.com',
      'api.openai.com'
    ],
    blockedDomains: [],
    timeout: 10000
  }
};
```

## Performance Tuning

### Memory Configuration

```typescript
const performanceConfig = {
  // Memory management
  memory: {
    maxHeapSize: '2048m',
    maxOldSpaceSize: '1536m',
    enableGC: true,
    gcInterval: 60000
  },
  
  // Token management
  tokens: {
    maxInputTokens: 100000,
    maxOutputTokens: 8192,
    compressionThreshold: 0.8,
    enableCompression: true
  },
  
  // Caching
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 300000,  // 5 minutes
    strategy: 'lru'
  },
  
  // Concurrency
  concurrency: {
    maxConcurrentRequests: 5,
    requestQueue: 100,
    timeout: 300000
  }
};
```

### Optimization Settings

```typescript
const optimizationConfig = {
  // Processing optimization
  processing: {
    enableBatching: true,
    batchSize: 10,
    enablePipelining: true,
    maxPipelineDepth: 3
  },
  
  // Response optimization
  response: {
    enableStreaming: true,
    chunkSize: 1024,
    enableCompression: true,
    compressionLevel: 6
  },
  
  // Tool optimization
  tools: {
    enableCaching: true,
    cacheSize: 50,
    enableParallelExecution: false,
    maxToolsPerRequest: 5
  }
};
```

## Security Configuration

### Authentication and Authorization

```typescript
const securityConfig = {
  // Authentication
  auth: {
    enabled: true,
    type: 'api_key',
    apiKey: process.env.AGENT_API_KEY,
    validateRequests: true
  },
  
  // Authorization
  authz: {
    enabled: true,
    roles: ['user', 'admin', 'developer'],
    permissions: {
      user: ['read', 'execute'],
      developer: ['read', 'write', 'execute'],
      admin: ['read', 'write', 'execute', 'admin']
    }
  },
  
  // Input validation
  validation: {
    maxInputLength: 100000,
    allowedMimeTypes: ['text/plain', 'application/json'],
    sanitizeInput: true,
    enableXSSProtection: true
  },
  
  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    enableBurst: true
  }
};
```

### Content Security

```typescript
const contentSecurityConfig = {
  // Content filtering
  contentFilter: {
    enabled: true,
    blockMaliciousCode: true,
    blockSensitiveData: true,
    allowedFileTypes: ['.js', '.ts', '.json', '.md'],
    maxFileSize: 10 * 1024 * 1024
  },
  
  // Code execution security
  codeExecution: {
    enableSandbox: true,
    allowedModules: ['fs', 'path', 'util'],
    blockedModules: ['child_process', 'cluster'],
    timeout: 30000,
    memoryLimit: '512m'
  },
  
  // Data protection
  dataProtection: {
    enableEncryption: true,
    encryptionAlgorithm: 'aes-256-gcm',
    enableDataMasking: true,
    retentionPeriod: 30 * 24 * 60 * 60 * 1000  // 30 days
  }
};
```

## Deployment Configuration

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy agent files
COPY dist/ ./dist/
COPY codeboltagent.yaml ./

# Set environment variables
ENV NODE_ENV=production
ENV AGENT_NAME=geminiagent
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Agent is healthy')" || exit 1

# Start agent
CMD ["node", "dist/index.js"]
```

### Kubernetes Configuration

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: geminiagent
  labels:
    app: geminiagent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: geminiagent
  template:
    metadata:
      labels:
        app: geminiagent
    spec:
      containers:
      - name: geminiagent
        image: codebolt/geminiagent:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: geminiagent-secrets
              key: api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Production Environment

```bash
# production.env
NODE_ENV=production
AGENT_DEBUG=false
LOG_LEVEL=warn
ENABLE_TELEMETRY=true
GEMINI_API_KEY=${GEMINI_API_KEY}
MAX_ITERATIONS=10
TIMEOUT_SECONDS=300
ENABLE_RATE_LIMITING=true
ENABLE_MONITORING=true
```

This comprehensive configuration guide covers all aspects of setting up and tuning the Gemini agent for different environments and use cases.