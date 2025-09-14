import { testComponent } from './test-utils';

describe('Text Component', () => {
  test('should render basic text', async () => {
    const template = '<Text content="This is plain text" />';
    const result = await testComponent(template);
    expect(result).toContain('This is plain text');
  });

  test('should render text with children', async () => {
    const template = '<Text>This is plain text</Text>';
    const result = await testComponent(template);
    expect(result).toContain('This is plain text');
  });

  test('should render text with html syntax', async () => {
    const template = '<Text syntax="html" content="This is plain text" />';
    const result = await testComponent(template);
    expect(result).toContain('This is plain text');
  });

  test('should render text with json syntax', async () => {
    const template = '<Text syntax="json" content="This is plain text" />';
    const result = await testComponent(template);
    expect(result).toContain('"type": "text"');
    expect(result).toContain('"content": "This is plain text"');
  });
});