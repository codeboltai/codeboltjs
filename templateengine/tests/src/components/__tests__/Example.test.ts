import { testComponent } from './test-utils';

describe('Example Component', () => {
  test('should render basic example', async () => {
    const template = '<Example title="Test Example">Example content</Example>';
    const result = await testComponent(template);
    expect(result).toContain('**📝 Example: Test Example **');
    expect(result).toContain('Example content');
  });

  test('should render example with description and category', async () => {
    const template = '<Example title="Test Example" description="This is a test" category="Testing">Example content</Example>';
    const result = await testComponent(template);
    expect(result).toContain('**Description:** This is a test');
    expect(result).toContain('**Category:** Testing');
  });

  test('should render example with different difficulty levels', async () => {
    const template1 = '<Example title="Test Example" difficulty="beginner">Example content</Example>';
    const result1 = await testComponent(template1);
    expect(result1).toContain('🟢');

    const template2 = '<Example title="Test Example" difficulty="intermediate">Example content</Example>';
    const result2 = await testComponent(template2);
    expect(result2).toContain('🟡');

    const template3 = '<Example title="Test Example" difficulty="advanced">Example content</Example>';
    const result3 = await testComponent(template3);
    expect(result3).toContain('🔴');
  });

  test('should render example with html syntax', async () => {
    const template = '<Example title="Test Example" syntax="html">Example content</Example>';
    const result = await testComponent(template);
    expect(result).toContain('<h2>📝 Example: Test Example');
  });
});