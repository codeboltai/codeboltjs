import { testComponent } from './test-utils';

describe('CodeboltToolFunction Component', () => {
  test('should render basic tool function', async () => {
    const template = '<CodeboltToolFunction />';
    const result = await testComponent(template);
    expect(result).toContain('### 🔧 Codebolt Tool Function');
  });

  test('should render tool function with name and function signature', async () => {
    const template = '<CodeboltToolFunction toolName="Calculator" toolFunction="add(a, b)" />';
    const result = await testComponent(template);
    expect(result).toContain('### 🔧 Calculator');
    expect(result).toContain('**Function:** add(a, b)');
  });

  test('should render tool function with details', async () => {
    const template = '<CodeboltToolFunction toolName="Calculator">Function details</CodeboltToolFunction>';
    const result = await testComponent(template);
    expect(result).toContain('**Details:**');
    expect(result).toContain('Function details');
  });

  test('should render tool function with html syntax', async () => {
    const template = '<CodeboltToolFunction toolName="Calculator" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="codebolt-tool-function">');
    expect(result).toContain('<h3>🔧 Calculator</h3>');
  });

  test('should render tool function with json syntax', async () => {
    const template = '<CodeboltToolFunction toolName="Calculator" syntax="json" />';
    const result = await testComponent(template);
    expect(result).toContain('"type": "codebolt-tool-function"');
    expect(result).toContain('"toolName": "Calculator"');
  });
});