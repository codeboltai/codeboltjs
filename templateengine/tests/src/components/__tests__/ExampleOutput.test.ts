import { testComponent } from './test-utils';

describe('ExampleOutput Component', () => {
  test('should render basic example output', async () => {
    const template = '<ExampleOutput label="Test Output">Output content</ExampleOutput>';
    const result = await testComponent(template);
    expect(result).toContain('**Test Output**\n');
    expect(result).toContain('Output content');
  });

  test('should render example output as block', async () => {
    const template = '<ExampleOutput label="Test Output" inline={false}>Output content</ExampleOutput>';
    const result = await testComponent(template);
    expect(result).toContain('**Test Output**\n');
    expect(result).toContain('Output content');
  });

  test('should render example output with format', async () => {
    const template = '<ExampleOutput label="Test Output" format="json" inline={false}>{jsonContent}</ExampleOutput>';
    const result = await testComponent(template, { jsonContent: '{"result": "success"}' });
    expect(result).toContain('```json\n{"result": "success"}\n```');
  });

  test('should render example output with html syntax', async () => {
    const template = '<ExampleOutput label="Test Output" syntax="html">Output content</ExampleOutput>';
    const result = await testComponent(template);
    expect(result).toContain('<h4>Test Output</h4>');
    expect(result).toContain('<code>Output content</code>');
  });
});