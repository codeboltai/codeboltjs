import { testComponent } from './test-utils';

describe('ExampleInput Component', () => {
  test('should render basic example input', async () => {
    const template = '<ExampleInput label="Test Input">Input content</ExampleInput>';
    const result = await testComponent(template);
    expect(result).toContain('**Test Input**\n');
    expect(result).toContain('Input content\n');
  });

  test('should render example input as block', async () => {
    const template = '<ExampleInput label="Test Input" inline={false}>Input content</ExampleInput>';
    const result = await testComponent(template);
    expect(result).toContain('**Test Input**');
    expect(result).toContain('Input content\n');
  });

  test('should render example input with format', async () => {
    const template = '<ExampleInput label="Test Input" format="javascript" inline={false}>const x = 1;</ExampleInput>';
    const result = await testComponent(template);
    expect(result).toContain('```javascript');
    expect(result).toContain('const x = 1;');
  });

  // test('should render example input with html syntax', async () => {
  //   const template = '<ExampleInput label="Test Input" syntax="html">Input content</ExampleInput>';
  //   const result = await testComponent(template);
  //   expect(result).toContain('<strong>Test Input:</strong>');
  //   expect(result).toContain('<code>Input content</code>');
  // });
});