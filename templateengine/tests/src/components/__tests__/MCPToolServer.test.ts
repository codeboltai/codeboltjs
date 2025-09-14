import { testComponent } from './test-utils';

describe('MCPToolServer Component', () => {
  test('should render basic MCP tool server', async () => {
    const template = '<MCPToolServer />';
    const result = await testComponent(template);
    expect(result).toContain('## 🌐 MCP Tool Servers');
  });

  test('should render MCP tool server with server names', async () => {
    const template = '<MCPToolServer mcpServerNames={[\"Server1\", \"Server2\"]} />';
    const result = await testComponent(template);
    expect(result).toContain('### Available MCP Servers:');
    expect(result).toContain('1. **Server1**');
    expect(result).toContain('2. **Server2**');
  });

  test('should render MCP tool server with tools', async () => {
    const template = '<MCPToolServer>Tool details</MCPToolServer>';
    const result = await testComponent(template);
    expect(result).toContain('### Tools:');
    expect(result).toContain('Tool details');
  });

  test('should render MCP tool server with html syntax', async () => {
    const template = '<MCPToolServer syntax=\"html\" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class=\"mcp-tool-server\">');
    expect(result).toContain('<h2>🌐 MCP Tool Servers</h2>');
  });
});