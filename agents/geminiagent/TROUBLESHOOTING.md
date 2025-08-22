# Gemini Agent Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Error Messages](#error-messages)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Tool Execution Issues](#tool-execution-issues)
- [LLM Integration Issues](#llm-integration-issues)
- [Development Issues](#development-issues)
- [Debugging Guide](#debugging-guide)
- [FAQ](#faq)
- [Getting Help](#getting-help)

## Common Issues

### 1. Agent Not Starting

**Symptoms:**
- Agent fails to start
- No response to messages
- Error during initialization

**Possible Causes:**
```
✗ Missing dependencies
✗ Invalid configuration
✗ Port conflicts
✗ Permission issues
```

**Solutions:**

```bash
# Check dependencies
npm ls @codebolt/codeboltjs @codebolt/agent

# Reinstall dependencies
npm ci

# Check configuration
npm run build

# Verify file permissions
ls -la dist/
```

**Debug Steps:**
1. Enable debug logging: `AGENT_DEBUG=true`
2. Check console output for errors
3. Verify all required files exist
4. Test with minimal configuration

### 2. Messages Not Being Processed

**Symptoms:**
- Messages sent but no response
- Agent appears to hang
- Partial responses

**Possible Causes:**
```
✗ Message format issues
✗ Processing loop errors
✗ Tool execution failures
✗ Token limit exceeded
```

**Solutions:**

```typescript
// Check message format
const validMessage = {
    content: "Hello",
    role: "user"
};

// Enable detailed logging
const agentStep = new LLMAgentStep({
    // ... config
    enableLogging: true
});

// Check iteration limits
maxIterations: 10  // Increase if needed
```

### 3. Tool Execution Failures

**Symptoms:**
- Tools not executing
- Permission denied errors
- File operation failures

**Possible Causes:**
```
✗ Insufficient permissions
✗ File path issues
✗ Tool configuration errors
✗ Security restrictions
```

**Solutions:**

```bash
# Check file permissions
ls -la /path/to/files

# Verify working directory
pwd

# Test tool manually
node -e "console.log(require('fs').readFileSync('test.txt', 'utf8'))"
```

## Error Messages

### Build Errors

#### Error: "Cannot find module '@codebolt/agent'"

```bash
Error: Cannot find module '@codebolt/agent/processor'
```

**Solution:**
```bash
# Install missing dependency
npm install @codebolt/agent

# Or update dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Error: "TypeScript compilation failed"

```bash
error TS2307: Cannot find module '@codebolt/agent/processor-pieces'
```

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --showConfig

# Update tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "Node16"
  }
}

# Rebuild
npm run clean && npm run build
```

### Runtime Errors

#### Error: "LLM request failed"

```javascript
Error: Failed to process LLM request: 401 Unauthorized
```

**Solution:**
```bash
# Set API key
export GEMINI_API_KEY=your_api_key

# Verify in code
console.log(process.env.GEMINI_API_KEY ? 'API key set' : 'API key missing');

# Test API connection
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://api.gemini.google.com/v1/models
```

#### Error: "Tool execution timeout"

```javascript
Error: Tool execution timeout after 30000ms
```

**Solution:**
```typescript
// Increase timeout
const toolExecutor = new ToolExecutor(toolList, {
    maxRetries: 3,
    timeout: 60000,  // Increase to 60 seconds
    enableLogging: true
});

// Or for specific tools
await tool.execute(params, {
    timeout: 120000  // 2 minutes for heavy operations
});
```

#### Error: "Maximum iterations exceeded"

```javascript
Error: Maximum iterations (10) exceeded
```

**Solution:**
```typescript
// Increase iteration limit
const agentStep = new LLMAgentStep({
    // ... other config
    maxIterations: 20,  // Increase limit
});

// Or implement better loop detection
new AdvancedLoopDetectionProcessor({
    toolCallThreshold: 3,
    contentLoopThreshold: 5,
    enableLLMDetection: true
});
```

### Memory Errors

#### Error: "JavaScript heap out of memory"

```bash
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json scripts
{
  "scripts": {
    "start": "node --max-old-space-size=4096 dist/index.js"
  }
}

# Enable garbage collection
node --expose-gc --max-old-space-size=4096 dist/index.js
```

## Performance Issues

### Slow Response Times

**Symptoms:**
- Long delays before responses
- Timeouts on complex requests
- High CPU/memory usage

**Diagnostics:**

```typescript
// Add performance monitoring
const start = Date.now();

// Process message
const result = await agentStep.step(message);

console.log(`Processing took ${Date.now() - start}ms`);

// Monitor memory usage
console.log('Memory usage:', process.memoryUsage());
```

**Optimizations:**

```typescript
// 1. Enable compression
new ChatCompressionProcessor({
    compressionThreshold: 0.7,
    tokenLimit: 100000
});

// 2. Optimize token management
new TokenManagementProcessor({
    maxTokens: 32000,
    warningThreshold: 0.8,
    enableCompression: true
});

// 3. Reduce tool retries
const toolExecutor = new ToolExecutor(toolList, {
    maxRetries: 2,  // Reduce from 3
    timeout: 30000
});

// 4. Limit iterations
maxIterations: 5  // Reduce from 10
```

### High Memory Usage

**Symptoms:**
- Memory usage keeps increasing
- Out of memory errors
- Slow garbage collection

**Solutions:**

```typescript
// 1. Implement memory cleanup
setInterval(() => {
    if (global.gc) {
        global.gc();
    }
}, 60000);  // Every minute

// 2. Limit conversation history
new ChatCompressionProcessor({
    compressionThreshold: 0.5,  // More aggressive compression
    tokenLimit: 50000
});

// 3. Clear tool caches
toolExecutor.clearCache();

// 4. Use streaming for large responses
enableStreaming: true
```

### Token Limit Issues

**Symptoms:**
- Requests rejected for being too long
- Incomplete responses
- Truncated tool outputs

**Solutions:**

```typescript
// 1. Implement smart compression
new ChatCompressionProcessor({
    compressionThreshold: 0.6,
    tokenLimit: 100000,
    preserveImportant: true
});

// 2. Split large requests
function splitLargeRequest(message) {
    const maxLength = 50000;
    if (message.content.length > maxLength) {
        return message.content.match(new RegExp(`.{1,${maxLength}}`, 'g'));
    }
    return [message.content];
}

// 3. Optimize tool outputs
tools.forEach(tool => {
    tool.maxOutputLength = 10000;
});
```

## Configuration Problems

### YAML Configuration Issues

**Common Problems:**
```yaml
# ✗ Invalid YAML syntax
metadata:
agent_routing:  # Missing spaces

# ✓ Correct syntax
metadata:
  agent_routing:
```

**Validation:**
```bash
# Validate YAML syntax
npm install -g js-yaml
js-yaml codeboltagent.yaml

# Or use online validator
cat codeboltagent.yaml | curl -X POST -H "Content-Type: text/plain" \
    --data-binary @- https://yamlvalidator.com/
```

### TypeScript Configuration Issues

**Common Problems:**
```json
// ✗ Incorrect module resolution
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node"
  }
}

// ✓ Correct for Node16
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "node16"
  }
}
```

### Environment Variable Issues

**Debug Environment Variables:**
```bash
# List all environment variables
env | grep -i agent

# Check specific variables
echo "GEMINI_API_KEY: ${GEMINI_API_KEY}"
echo "NODE_ENV: ${NODE_ENV}"
echo "AGENT_DEBUG: ${AGENT_DEBUG}"

# Load from .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi
```

## Tool Execution Issues

### File Operation Failures

**Permission Issues:**
```bash
# Check file permissions
ls -la path/to/file

# Fix permissions
chmod 644 path/to/file        # Read/write for owner
chmod 755 path/to/directory   # Execute for directory

# Change ownership
chown user:group path/to/file
```

**Path Resolution Issues:**
```typescript
// Use absolute paths
const fs = require('fs');
const path = require('path');

// Resolve relative paths
const absolutePath = path.resolve(process.cwd(), relativePath);

// Check if file exists
if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
}
```

### Tool Registration Issues

**Missing Tools:**
```typescript
// Check tool registration
console.log('Available tools:', toolList.getToolNames());

// Verify tool is properly registered
const tool = toolList.getTool('FileReadTool');
if (!tool) {
    console.error('FileReadTool not found');
}

// Register tool manually
toolList.addTool(new FileReadTool());
```

**Tool Parameter Issues:**
```typescript
// Validate tool parameters
class CustomTool extends BaseTool {
    async execute(params) {
        // Validate required parameters
        if (!params.filePath) {
            throw new Error('filePath parameter is required');
        }
        
        // Validate parameter types
        if (typeof params.filePath !== 'string') {
            throw new Error('filePath must be a string');
        }
        
        // Continue with execution
        return await this.performOperation(params);
    }
}
```

## LLM Integration Issues

### API Connection Problems

**Test API Connection:**
```bash
# Test Gemini API
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

**Network Issues:**
```typescript
// Add retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetch(url, options);
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
};
```

### Model Configuration Issues

**Model Selection:**
```typescript
// Check available models
const availableModels = [
    'gemini-1.5-pro',
    'gemini-pro',
    'gpt-4-turbo',
    'claude-3-opus'
];

// Implement fallback logic
async function selectModel(preferredModel) {
    for (const model of availableModels) {
        try {
            await testModelConnection(model);
            return model;
        } catch (error) {
            console.warn(`Model ${model} unavailable:`, error.message);
        }
    }
    throw new Error('No available models');
}
```

## Development Issues

### Hot Reload Problems

**TypeScript Watch Mode:**
```bash
# Start TypeScript in watch mode
npx tsc --watch

# Or use ts-node-dev for automatic restarts
npm install -g ts-node-dev
ts-node-dev --respawn src/index.ts
```

**File Watching Issues:**
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# For macOS, use fsevents
npm install fsevents
```

### Debugging in IDE

**VS Code Configuration:**
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Gemini Agent",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/dist/index.js",
            "env": {
                "NODE_ENV": "development",
                "AGENT_DEBUG": "true"
            },
            "console": "integratedTerminal",
            "sourceMaps": true,
            "outFiles": ["${workspaceFolder}/dist/**/*.js"]
        }
    ]
}
```

## Debugging Guide

### Enable Debug Logging

```bash
# Environment variable
export AGENT_DEBUG=true

# Or in code
process.env.AGENT_DEBUG = 'true';
```

### Log Analysis

```typescript
// Structured logging
const logger = {
    debug: (message, data) => {
        if (process.env.AGENT_DEBUG) {
            console.log(`[DEBUG] ${new Date().toISOString()} ${message}`, data);
        }
    },
    
    info: (message, data) => {
        console.log(`[INFO] ${new Date().toISOString()} ${message}`, data);
    },
    
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
    }
};

// Usage
logger.debug('Processing message', { messageId: 'abc123' });
logger.info('Tool executed successfully', { toolName: 'FileReadTool' });
logger.error('LLM request failed', error);
```

### Performance Profiling

```typescript
// Add performance markers
console.time('message-processing');
const result = await processMessage(message);
console.timeEnd('message-processing');

// Memory profiling
const memUsage = process.memoryUsage();
console.log('Memory usage:', {
    rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
});
```

### Request/Response Logging

The agent automatically logs LLM requests and responses to the `llm-requests/` directory:

```bash
# View recent requests
ls -la llm-requests/ | tail -10

# Analyze a specific request
cat llm-requests/llm-request-*.json | jq .

# View response
cat llm-requests/llm-response-*.json | jq .
```

## FAQ

### Q: Why is my agent not responding to messages?

**A:** Check the following:
1. Agent is properly started and connected
2. Message format is correct
3. No errors in console logs
4. CodeBolt connection is active
5. API keys are set correctly

### Q: How can I reduce token usage?

**A:** Use these strategies:
1. Enable chat compression
2. Limit conversation history
3. Optimize tool outputs
4. Use shorter prompts
5. Implement smart caching

### Q: Can I use multiple LLM providers?

**A:** Yes, configure multiple models in `codeboltagent.yaml`:
```yaml
metadata:
  llm_role:
    - name: primary
      modelorder:
        - gemini-1.5-pro
        - gpt-4-turbo
```

### Q: How do I add custom tools?

**A:** Extend the `BaseTool` class:
```typescript
class MyTool extends BaseTool {
    constructor() {
        super('MyTool', 'Description', { param: 'string' });
    }
    
    async execute(params) {
        return { result: 'success' };
    }
}

toolList.addTool(new MyTool());
```

### Q: Why are my file operations failing?

**A:** Common causes:
1. Insufficient file permissions
2. Incorrect file paths
3. Files don't exist
4. Security restrictions
5. Tool not properly registered

### Q: How can I improve performance?

**A:** Try these optimizations:
1. Increase Node.js memory limit
2. Enable compression
3. Reduce iteration limits
4. Optimize tool execution
5. Use caching strategies

### Q: What's the maximum file size for operations?

**A:** Default limits:
- File read: 10MB
- File write: Unlimited (but consider memory)
- Tool execution timeout: 30 seconds

Configure in tool settings:
```typescript
new FileReadTool({
    maxFileSize: 20 * 1024 * 1024  // 20MB
});
```

### Q: How do I handle rate limits?

**A:** Implement rate limiting:
```typescript
const rateLimiter = {
    requests: [],
    maxRequests: 60,
    timeWindow: 60000,  // 1 minute
    
    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        return this.requests.length < this.maxRequests;
    },
    
    recordRequest() {
        this.requests.push(Date.now());
    }
};
```

## Getting Help

### Community Support

- **GitHub Issues**: [codeboltai/codeboltjs/issues](https://github.com/codeboltai/codeboltjs/issues)
- **Discord**: [Join our Discord server](https://discord.gg/codebolt)
- **Documentation**: [docs.codebolt.ai](https://docs.codebolt.ai)

### Reporting Bugs

When reporting bugs, include:

1. **Agent Version**: Check `package.json`
2. **Environment**: Node.js version, OS, etc.
3. **Configuration**: Relevant config files
4. **Error Messages**: Full stack traces
5. **Steps to Reproduce**: Minimal reproduction case
6. **Expected vs Actual**: What should happen vs what happens

### Bug Report Template

```markdown
## Bug Report

**Agent Version**: 1.0.0
**Node.js Version**: 20.11.0
**OS**: Windows 11 / macOS 14 / Ubuntu 22.04

**Description**:
Brief description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Error Messages**:
```
Error details here
```

**Configuration**:
```yaml
# Relevant config
```

**Additional Context**:
Any other relevant information
```

### Feature Requests

For feature requests, describe:
1. **Use Case**: Why is this needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other possible approaches
4. **Impact**: Who would benefit?

This troubleshooting guide should help you resolve most common issues with the Gemini agent. If you encounter problems not covered here, please check the GitHub issues or reach out to the community for support.