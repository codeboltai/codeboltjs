# Testing

This project uses Jest as its testing framework.

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

To run a specific test file:

```bash
npm test -- src/__tests__/McpService.test.ts
```

## Test Structure

- Unit tests are located in `src/__tests__/`
- Test files follow the naming convention `*.test.ts`
- Integration tests follow the naming convention `*.integration.test.ts`

## Test Coverage

The tests cover the following scenarios for the McpService:

1. Reading MCP servers when the config file does not exist (should return empty array)
2. Reading MCP servers when the config file contains invalid JSON (should return empty array)
3. Reading MCP servers when the config file has no servers property (should return empty array)
4. Reading MCP servers when the config file is valid (should return the servers array)
5. Handling errors when reading the file (should return empty array)

The tests also cover the McpController and McpRoutes:

1. Getting all MCP servers via the API endpoint
2. Getting a specific MCP server by ID
3. Health check endpoint
4. Error handling in the API endpoints

## Writing New Tests

1. Create a new test file in `src/__tests__/` with the `.test.ts` extension
2. Import the modules you need to test
3. Write your test cases using Jest's `describe` and `it` functions
4. Use `expect` assertions to verify the behavior