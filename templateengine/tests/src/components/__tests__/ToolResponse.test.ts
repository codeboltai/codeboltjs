import { testComponent } from './test-utils';

describe('ToolResponse Component', () => {
  test('should render successful tool response', async () => {
    const template = '<ToolResponse tool="calculator" status="success">Response details</ToolResponse>';
    const result = await testComponent(template);
    expect(result).toContain('✅ Tool Response');
    expect(result).toContain('- **Tool**: calculator');
    expect(result).toContain('- **Status**: success');
    expect(result).toContain('**Details**: Response details');
  });

  test('should render tool response with data', async () => {
    const template = '<ToolResponse tool="calculator" status="success" data={{result: 3}}>Response details</ToolResponse>';
    const result = await testComponent(template);
    expect(result).toContain('- **Data**: {');
    expect(result).toContain('"result": 3');
  });

  test('should render tool response with error', async () => {
    const template = '<ToolResponse tool="calculator" status="error" error="Calculation failed">Response details</ToolResponse>';
    const result = await testComponent(template);
    expect(result).toContain('- **Error**: Calculation failed');
  });

  test('should render tool response with html syntax', async () => {
    const template = '<ToolResponse tool="calculator" status="success" syntax="html">Response details</ToolResponse>';
    const result = await testComponent(template);
    expect(result).toContain('<h4>✅ Tool Response</h4>');
    expect(result).toContain('<li><strong>Tool:</strong> calculator</li>');
    expect(result).toContain('<li><strong>Status:</strong> success</li>');
  });
});