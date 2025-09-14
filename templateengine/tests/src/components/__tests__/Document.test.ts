import { testComponent } from './test-utils';

describe('Document Component', () => {
  test('should render document with title', async () => {
    const template = '<Document title="Test Document">Document content</Document>';
    const result = await testComponent(template);
    expect(result).toContain('# Test Document');
    expect(result).toContain('Document content');
  });

  test('should render document with author and version', async () => {
    const template = '<Document title="Test Document" author="John Doe" version="1.0">Document content</Document>';
    const result = await testComponent(template);
    expect(result).toContain('**Author:** John Doe');
    expect(result).toContain('**Version:** 1.0');
  });

  test('should render document with html syntax', async () => {
    const template = '<Document title="Test Document" syntax="html">Document content</Document>';
    const result = await testComponent(template);
    expect(result).toContain('<title>Test Document</title>');
    expect(result).toContain('<h1>Test Document</h1>');
  });

  test('should render document with json syntax', async () => {
    const template = '<Document title="Test Document" syntax="json">Document content</Document>';
    const result = await testComponent(template);
    expect(result).toContain('"title": "Test Document"');
  });
});