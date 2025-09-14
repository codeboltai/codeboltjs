import { epomlparse } from 'epoml';

/**
 * This example demonstrates the new tool-related components:
 * - CodeboltToolServer
 * - MCPToolServer
 * - CodeboltToolFunction
 * - MCPToolFunction
 */

async function toolComponentsExample() {
  console.log('=== EPOML Tool Components Example ===\n');

  // Example 1: CodeboltToolServer with foreach support
  console.log('Example 1: CodeboltToolServer with foreach support');
  const codeboltServerTemplate = `
<CodeboltToolServer toolServerNames={["Server1", "Server2", "Server3"]}>
  <list>
    <item>ToolCall1: function1()</item>
    <item>ToolCall2: function2()</item>
    <item>ToolCall3: function3()</item>
  </list>
</CodeboltToolServer>
  `;
  const codeboltServerResult = await epomlparse(codeboltServerTemplate);
  console.log(`Template: ${codeboltServerTemplate.trim()}`);
  console.log(`Result:\n${codeboltServerResult.trim()}\n`);
  console.log('---\n');

  // Example 2: MCPToolServer with for loop support
  console.log('Example 2: MCPToolServer with for loop support');
  const mcpServerTemplate = `
<MCPToolServer mcpServerNames={["MCP1", "MCP2"]}>
  <list>
    <item>Tool1: mcpFunction1()</item>
    <item>Tool2: mcpFunction2()</item>
  </list>
</MCPToolServer>
  `;
  const mcpServerResult = await epomlparse(mcpServerTemplate);
  console.log(`Template: ${mcpServerTemplate.trim()}`);
  console.log(`Result:\n${mcpServerResult.trim()}\n`);
  console.log('---\n');

  // Example 3: CodeboltToolFunction
  console.log('Example 3: CodeboltToolFunction');
  const codeboltFunctionTemplate = `
<CodeboltToolFunction toolName="FileReader" toolFunction="readFile(path: string): string">
  <p>Reads a file from the specified path and returns its content as a string.</p>
</CodeboltToolFunction>
  `;
  const codeboltFunctionResult = await epomlparse(codeboltFunctionTemplate);
  console.log(`Template: ${codeboltFunctionTemplate.trim()}`);
  console.log(`Result:\n${codeboltFunctionResult.trim()}\n`);
  console.log('---\n');

  // Example 4: MCPToolFunction
  console.log('Example 4: MCPToolFunction');
  const mcpFunctionTemplate = `
<MCPToolFunction toolName="DatabaseQuery" toolFunction="query(sql: string): ResultSet">
  <p>Executes a SQL query against the connected database and returns the result set.</p>
</MCPToolFunction>
  `;
  const mcpFunctionResult = await epomlparse(mcpFunctionTemplate);
  console.log(`Template: ${mcpFunctionTemplate.trim()}`);
  console.log(`Result:\n${mcpFunctionResult.trim()}\n`);
  console.log('---\n');

  // Example 5: Combined usage - Codebolt components
  console.log('Example 5: Combined usage - Codebolt components');
  const combinedCodeboltTemplate = `
<CodeboltToolServer toolServerNames={["FileServer", "NetworkServer"]}>
  <CodeboltToolFunction toolName="FileReader" toolFunction="readFile(path: string): string">
    <p>Reads a file from the specified path.</p>
  </CodeboltToolFunction>
  <CodeboltToolFunction toolName="FileWriter" toolFunction="writeFile(path: string, content: string): void">
    <p>Writes content to a file at the specified path.</p>
  </CodeboltToolFunction>
</CodeboltToolServer>
  `;
  const combinedCodeboltResult = await epomlparse(combinedCodeboltTemplate);
  console.log(`Template: ${combinedCodeboltTemplate.trim()}`);
  console.log(`Result:\n${combinedCodeboltResult.trim()}\n`);
  console.log('---\n');

  // Example 6: Combined usage - MCP components
  console.log('Example 6: Combined usage - MCP components');
  const combinedMcpTemplate = `
<MCPToolServer mcpServerNames={["DatabaseServer"]}>
  <MCPToolFunction toolName="QueryExecutor" toolFunction="executeQuery(sql: string): ResultSet">
    <p>Executes a SQL query and returns results.</p>
  </MCPToolFunction>
</MCPToolServer>
  `;
  const combinedMcpResult = await epomlparse(combinedMcpTemplate);
  console.log(`Template: ${combinedMcpTemplate.trim()}`);
  console.log(`Result:\n${combinedMcpResult.trim()}\n`);
}

// Run the example
toolComponentsExample().catch(console.error);