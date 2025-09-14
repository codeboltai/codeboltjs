import { testComponent } from './test-utils';

describe('MCPToolFunction Component', () => {
  test('should render basic MCP tool function', async () => {
    const template = '<MCPToolFunction />';
    const result = await testComponent(template);
    expect(result).toContain('### 🌐 MCP Tool Function');
  });

  test('should render MCP tool function with name and function signature', async () => {
    const template = '<MCPToolFunction toolName="Calculator" toolFunction="add(a, b)" />';
    const result = await testComponent(template);
    expect(result).toContain('### 🌐 Calculator');
    expect(result).toContain('**Function:** add(a, b)');
  });

  test('should render MCP tool function with details', async () => {
    const template = '<MCPToolFunction toolName="Calculator">Function details</MCPToolFunction>';
    const result = await testComponent(template);
    expect(result).toContain('**Details:**');
    expect(result).toContain('Function details');
  });

  test('should render MCP tool function with html syntax', async () => {
    const template = '<MCPToolFunction toolName="Calculator" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="mcp-tool-function">');
    expect(result).toContain('<h3>🌐 Calculator</h3>');
  });

  test('should render MCP tool function with json syntax', async () => {
    const template = '<MCPToolFunction toolName="Calculator" syntax="json" />';
    const result = await testComponent(template);
    expect(result).toContain('"type": "mcp-tool-function"');
    expect(result).toContain('"toolName": "Calculator"');
  });
});