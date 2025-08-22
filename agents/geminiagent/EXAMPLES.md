# Gemini Agent Examples and Usage Guide

## Table of Contents

- [Basic Usage Examples](#basic-usage-examples)
- [File Operations](#file-operations)
- [Code Generation](#code-generation)
- [Project Analysis](#project-analysis)
- [Custom Tool Development](#custom-tool-development)
- [Advanced Workflows](#advanced-workflows)
- [Integration Examples](#integration-examples)
- [Testing Examples](#testing-examples)
- [Real-World Use Cases](#real-world-use-cases)

## Basic Usage Examples

### Example 1: Simple Message Processing

The most basic way to interact with the Gemini agent is through the CodeBolt message system:

```typescript
// The agent automatically handles messages through codebolt.onMessage()
// Users can interact by sending messages through the CodeBolt interface

// Example user inputs:
// "Hello, can you help me with my React project?"
// "What files are in my current directory?"
// "Explain the structure of package.json"
```

### Example 2: Direct Integration

For custom applications, you can integrate the agent components directly:

```typescript
import codebolt from '@codebolt/codeboltjs';
import { 
    RequestMessage, 
    LLMAgentStep, 
    ToolExecutor, 
    ToolListClass as ToolList 
} from '@codebolt/agent/processor';

// Initialize the agent
async function initializeAgent() {
    const toolList = new ToolList([
        new FileReadTool(),
        new FileWriteTool(),
        new FileDeleteTool()
    ]);
    
    const toolExecutor = new ToolExecutor(toolList, {
        maxRetries: 3,
        enableLogging: true
    });
    
    const agentStep = new LLMAgentStep({
        toolList,
        toolExecutor,
        llmconfig: {
            llmname: "gemini-pro",
            model: "gemini-pro",
            temperature: 0.7,
            maxTokens: 8192
        },
        maxIterations: 10
    });
    
    return { toolList, toolExecutor, agentStep };
}

// Process a message
async function processUserMessage(message: string) {
    const { agentStep } = await initializeAgent();
    
    const messageObject = {
        messages: [{
            role: 'user',
            content: message
        }]
    };
    
    const response = await agentStep.step(messageObject);
    return response;
}

// Usage
const response = await processUserMessage("Create a simple Node.js server");
console.log(response);
```

## File Operations

### Example 3: Reading Files

```typescript
// User: "Read the contents of package.json"
// Agent response will:
// 1. Detect file read request
// 2. Execute FileReadTool with path "package.json"
// 3. Return formatted file contents

// Example interaction:
const result = await processUserMessage("Show me the contents of src/index.ts");

// The agent will automatically:
// - Resolve the file path
// - Read the file using FileReadTool
// - Format and return the contents
```

### Example 4: Writing Files

```typescript
// User: "Create a new file called hello.js with a simple console.log"
// Agent will:
// 1. Generate appropriate JavaScript code
// 2. Use FileWriteTool to create the file
// 3. Confirm creation

// Example for creating a React component:
const createComponentRequest = `
Create a new React functional component called UserCard that:
- Takes props: name, email, avatar
- Displays user information in a card layout
- Save it as src/components/UserCard.jsx
`;

const response = await processUserMessage(createComponentRequest);
```

### Example 5: File Management Operations

```typescript
// Moving files
await processUserMessage("Move the file temp.js to the backup folder");

// Copying files
await processUserMessage("Copy config.json to config.backup.json");

// Deleting files
await processUserMessage("Delete the old-file.txt file");

// Batch operations
await processUserMessage(`
Organize my JavaScript files:
1. Move all .js files from root to src/
2. Create a backup of package.json
3. Delete any .tmp files
`);
```

## Code Generation

### Example 6: React Component Generation

```typescript
const componentRequest = `
Create a React component called TodoList that:
- Uses React hooks (useState, useEffect)
- Manages a list of todos with add/remove functionality
- Has proper TypeScript types
- Includes CSS-in-JS styling
- Save as src/components/TodoList.tsx
`;

// The agent will:
// 1. Generate a complete React component
// 2. Include proper imports and types
// 3. Create the file using FileWriteTool
// 4. Provide explanation of the code

const result = await processUserMessage(componentRequest);
```

### Example 7: API Endpoint Creation

```typescript
const apiRequest = `
Create an Express.js API endpoint that:
- Route: POST /api/users
- Validates user input (name, email, password)
- Hashes password using bcrypt
- Saves user to database
- Returns user object (without password)
- Include error handling
- Save as src/routes/users.js
`;

// Agent will generate complete Express route with:
// - Input validation
// - Error handling
// - Database interaction
// - Security best practices
```

### Example 8: Database Schema

```typescript
const schemaRequest = `
Create a MongoDB schema for a blog application:
- User model (name, email, password, role)
- Post model (title, content, author, tags, createdAt)
- Comment model (content, author, post, createdAt)
- Include proper relationships and validation
- Save as src/models/index.js
`;

// Generates complete Mongoose schemas with relationships
```

## Project Analysis

### Example 9: Code Review

```typescript
const reviewRequest = `
Analyze the current project structure and provide:
1. Code quality assessment
2. Security vulnerabilities
3. Performance optimization suggestions
4. Best practices recommendations
5. Dependencies analysis
`;

// Agent will:
// - Read multiple project files
// - Analyze code patterns
// - Check for common issues
// - Provide detailed recommendations
```

### Example 10: Documentation Generation

```typescript
const docRequest = `
Generate comprehensive documentation for this project:
1. README.md with setup instructions
2. API documentation for all endpoints
3. Code comments for complex functions
4. CHANGELOG.md for version history
`;

// Agent analyzes codebase and generates appropriate documentation
```

### Example 11: Test Coverage Analysis

```typescript
const testAnalysisRequest = `
Analyze test coverage in this project:
1. Identify untested functions
2. Suggest test cases for critical paths
3. Generate missing unit tests
4. Create integration test examples
`;

// Provides comprehensive testing strategy
```

## Custom Tool Development

### Example 12: Database Tool

```typescript
import { BaseTool } from '@codebolt/agent/processor';

class DatabaseQueryTool extends BaseTool {
    constructor() {
        super(
            'DatabaseQuery',
            'Execute database queries safely',
            {
                query: {
                    type: 'string',
                    description: 'SQL query to execute',
                    required: true
                },
                database: {
                    type: 'string',
                    description: 'Database name',
                    required: true
                }
            }
        );
    }

    async execute(params: any): Promise<any> {
        try {
            // Validate query safety
            this.validateQuery(params.query);
            
            // Execute query (implement your database logic)
            const result = await this.executeQuery(params.query, params.database);
            
            return {
                success: true,
                result: result,
                metadata: {
                    rowCount: result.length,
                    executionTime: Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    private validateQuery(query: string): void {
        // Prevent dangerous operations
        const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
        const upperQuery = query.toUpperCase();
        
        for (const keyword of dangerousKeywords) {
            if (upperQuery.includes(keyword)) {
                throw new Error(`Dangerous operation not allowed: ${keyword}`);
            }
        }
    }
    
    private async executeQuery(query: string, database: string): Promise<any[]> {
        // Implement your database connection and query execution
        // This is a placeholder implementation
        return [];
    }
}

// Register the tool
toolList.addTool(new DatabaseQueryTool());
```

### Example 13: Git Integration Tool

```typescript
import { BaseTool } from '@codebolt/agent/processor';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GitTool extends BaseTool {
    constructor() {
        super(
            'Git',
            'Execute Git operations',
            {
                command: {
                    type: 'string',
                    description: 'Git command to execute',
                    required: true
                },
                options: {
                    type: 'object',
                    description: 'Additional options',
                    required: false
                }
            }
        );
    }

    async execute(params: any): Promise<any> {
        try {
            const allowedCommands = ['status', 'log', 'diff', 'branch', 'add', 'commit'];
            const command = params.command.toLowerCase();
            
            if (!allowedCommands.includes(command)) {
                throw new Error(`Git command not allowed: ${command}`);
            }
            
            const gitCommand = `git ${params.command}`;
            const { stdout, stderr } = await execAsync(gitCommand);
            
            return {
                success: true,
                output: stdout,
                error: stderr,
                command: gitCommand
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Usage example
const gitStatus = await gitTool.execute({ command: 'status' });
```

### Example 14: Code Formatter Tool

```typescript
import { BaseTool } from '@codebolt/agent/processor';
import prettier from 'prettier';

class CodeFormatterTool extends BaseTool {
    constructor() {
        super(
            'CodeFormatter',
            'Format code using Prettier',
            {
                code: {
                    type: 'string',
                    description: 'Code to format',
                    required: true
                },
                language: {
                    type: 'string',
                    description: 'Programming language',
                    required: true
                },
                options: {
                    type: 'object',
                    description: 'Prettier options',
                    required: false
                }
            }
        );
    }

    async execute(params: any): Promise<any> {
        try {
            const options = {
                parser: this.getParser(params.language),
                tabWidth: 2,
                semi: true,
                singleQuote: true,
                ...params.options
            };
            
            const formattedCode = prettier.format(params.code, options);
            
            return {
                success: true,
                formattedCode: formattedCode,
                originalLength: params.code.length,
                formattedLength: formattedCode.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    private getParser(language: string): string {
        const parsers = {
            'javascript': 'babel',
            'typescript': 'typescript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'markdown': 'markdown'
        };
        
        return parsers[language.toLowerCase()] || 'babel';
    }
}
```

## Advanced Workflows

### Example 15: Multi-Step Project Setup

```typescript
const projectSetupRequest = `
Set up a new React TypeScript project with:
1. Create project structure (src, public, tests folders)
2. Generate package.json with necessary dependencies
3. Create tsconfig.json with strict settings
4. Set up Prettier and ESLint configuration
5. Create a basic App component
6. Generate a README with setup instructions
7. Initialize Git repository
`;

// The agent will execute multiple tools in sequence:
// 1. Directory creation
// 2. File generation
// 3. Configuration setup
// 4. Git initialization
```

### Example 16: Code Migration Workflow

```typescript
const migrationRequest = `
Migrate this JavaScript project to TypeScript:
1. Analyze existing .js files
2. Add TypeScript types to all functions
3. Create interface definitions for objects
4. Update import/export statements
5. Configure TypeScript compiler
6. Update build scripts
7. Generate type declaration files
`;

// Complex workflow involving:
// - File analysis
// - Code transformation
// - Configuration updates
// - Build system changes
```

### Example 17: Performance Optimization Workflow

```typescript
const optimizationRequest = `
Optimize this React application for performance:
1. Analyze bundle size and dependencies
2. Identify unnecessary re-renders
3. Implement React.memo where appropriate
4. Add lazy loading for routes
5. Optimize images and assets
6. Set up code splitting
7. Generate performance report
`;

// Multi-tool workflow for comprehensive optimization
```

## Integration Examples

### Example 18: CI/CD Pipeline Integration

```typescript
// GitHub Actions workflow generation
const cicdRequest = `
Create a GitHub Actions workflow that:
1. Runs on push to main branch
2. Sets up Node.js environment
3. Installs dependencies
4. Runs tests with coverage
5. Builds the application
6. Deploys to staging environment
7. Sends notifications on failure
Save as .github/workflows/ci.yml
`;

// Generates complete CI/CD configuration
```

### Example 19: Docker Integration

```typescript
const dockerRequest = `
Create Docker configuration for this Node.js app:
1. Multi-stage Dockerfile for production
2. Docker Compose for development
3. Environment-specific configurations
4. Health checks and monitoring
5. Security best practices
Save Dockerfile and docker-compose.yml
`;

// Creates production-ready Docker setup
```

### Example 20: Database Integration

```typescript
const dbIntegrationRequest = `
Set up database integration:
1. Configure MongoDB connection
2. Create data models with Mongoose
3. Set up database migrations
4. Add connection pooling
5. Implement error handling
6. Create database seeding scripts
`;

// Complete database setup with best practices
```

## Testing Examples

### Example 21: Unit Test Generation

```typescript
const testRequest = `
Generate comprehensive unit tests for the UserService class:
1. Test all public methods
2. Mock external dependencies
3. Test error scenarios
4. Include edge cases
5. Use Jest and Testing Library
6. Achieve 100% code coverage
Save as src/services/__tests__/UserService.test.ts
`;

// Generates complete test suite with mocks and assertions
```

### Example 22: Integration Test Creation

```typescript
const integrationTestRequest = `
Create integration tests for the API:
1. Test all endpoints
2. Set up test database
3. Test authentication flow
4. Verify data persistence
5. Test error responses
6. Include performance tests
Save as tests/integration/api.test.js
`;

// Creates end-to-end API testing suite
```

### Example 23: E2E Test Setup

```typescript
const e2eTestRequest = `
Set up end-to-end testing with Playwright:
1. Configure Playwright
2. Create page object models
3. Test user workflows
4. Add visual regression tests
5. Set up CI integration
6. Generate test reports
Create tests/e2e/ directory structure
`;

// Complete E2E testing framework setup
```

## Real-World Use Cases

### Example 24: Bug Fix Workflow

```typescript
// User reports a bug
const bugFixRequest = `
There's a bug in the user login system:
1. Analyze the authentication code
2. Identify the root cause
3. Suggest fixes
4. Implement the solution
5. Add tests to prevent regression
6. Update documentation
Bug: Users can't login with special characters in password
`;

// Agent will:
// - Analyze authentication logic
// - Identify encoding/validation issues
// - Implement proper handling
// - Add comprehensive tests
```

### Example 25: Feature Development

```typescript
const featureRequest = `
Add a real-time chat feature to the application:
1. Design WebSocket architecture
2. Create chat message model
3. Implement server-side Socket.io integration
4. Build React chat component
5. Add message persistence
6. Implement user presence status
7. Add typing indicators
8. Create comprehensive tests
`;

// Full feature development cycle
```

### Example 26: Security Audit

```typescript
const securityAuditRequest = `
Perform a security audit of the application:
1. Check for SQL injection vulnerabilities
2. Analyze authentication implementation
3. Review authorization logic
4. Check for XSS vulnerabilities
5. Audit dependency security
6. Verify input validation
7. Generate security report
8. Suggest remediation steps
`;

// Comprehensive security analysis
```

### Example 27: Performance Monitoring Setup

```typescript
const monitoringRequest = `
Set up performance monitoring:
1. Configure application metrics
2. Set up error tracking
3. Add performance profiling
4. Create monitoring dashboards
5. Set up alerting rules
6. Implement health checks
7. Add logging best practices
`;

// Complete monitoring and observability setup
```

### Example 28: API Documentation Generation

```typescript
const apiDocRequest = `
Generate API documentation from the Express.js routes:
1. Analyze all route handlers
2. Extract parameters and responses
3. Generate OpenAPI/Swagger spec
4. Create interactive documentation
5. Add code examples
6. Include authentication details
7. Generate client SDKs
Save as docs/api/
`;

// Automatic API documentation generation
```

### Example 29: Code Refactoring

```typescript
const refactoringRequest = `
Refactor the legacy user management code:
1. Extract business logic into services
2. Implement proper error handling
3. Add input validation
4. Convert to async/await pattern
5. Add comprehensive logging
6. Improve code organization
7. Maintain backward compatibility
8. Add migration guide
`;

// Systematic code modernization
```

### Example 30: Deployment Automation

```typescript
const deploymentRequest = `
Automate the deployment process:
1. Set up infrastructure as code
2. Configure blue-green deployment
3. Add automated testing in pipeline
4. Set up monitoring and alerting
5. Create rollback procedures
6. Add deployment notifications
7. Generate deployment documentation
`;

// Complete deployment automation setup
```

## Usage Tips

### Best Practices

1. **Be Specific**: Provide clear, detailed requirements
2. **Context Matters**: Include relevant project information
3. **Iterative Approach**: Break complex tasks into steps
4. **Validation**: Always review generated code
5. **Testing**: Include testing requirements in requests

### Common Patterns

```typescript
// Pattern 1: Analysis + Implementation
"Analyze the current authentication system and improve security"

// Pattern 2: Generation + Testing
"Create a user registration API with comprehensive tests"

// Pattern 3: Migration + Validation
"Convert this JavaScript module to TypeScript and ensure type safety"

// Pattern 4: Setup + Configuration
"Set up a React project with TypeScript, ESLint, and Prettier"

// Pattern 5: Investigation + Solution
"Debug the memory leak issue and implement a fix"
```

### Error Handling

The agent includes robust error handling for common scenarios:

```typescript
// File not found
"The file 'nonexistent.js' could not be found. Please check the path."

// Permission denied
"Permission denied when writing to 'protected.txt'. Please check file permissions."

// Syntax error
"The generated code has a syntax error on line 15. Let me fix that."

// Tool execution timeout
"The operation took too long to complete. Let me try a different approach."
```

These examples demonstrate the versatility and power of the Gemini agent for various development tasks. The agent can handle simple file operations to complex multi-step workflows, making it a valuable tool for developers at all levels.