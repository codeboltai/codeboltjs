import { testComponent } from './test-utils';

describe('ToolRequest Component', () => {
  test('should render basic tool request', async () => {
    const template = '<ToolRequest tool="calculator">Request details</ToolRequest>';
    const result = await testComponent(template);
    expect(result).toContain('🔧 Tool Request');
    expect(result).toContain('- **Tool**: calculator');
    expect(result).toContain('**Details**: Request details');
  });

  test('should render tool request with parameters', async () => {
    const template = '<ToolRequest tool="calculator" parameters={{operation: "add", a: 1, b: 2}}>Request details</ToolRequest>';
    const result = await testComponent(template);
    expect(result).toContain('- **Parameters**:');
    expect(result).toContain('- operation: "add"');
    expect(result).toContain('- a: 1');
    expect(result).toContain('- b: 2');
  });

  test('should render tool request with request ID', async () => {
    const template = '<ToolRequest tool="calculator" requestId="123">Request details</ToolRequest>';
    const result = await testComponent(template);
    expect(result).toContain('- **Request ID**: 123');
  });

  test('should render tool request with html syntax', async () => {
    const template = '<ToolRequest tool="calculator" syntax="html">Request details</ToolRequest>';
    const result = await testComponent(template);
    expect(result).toContain('<h4>🔧 Tool Request</h4>');
    expect(result).toContain('<li><strong>Tool:</strong> calculator</li>');
  });
});