import { testComponent } from './test-utils';

describe('MessageContext Component', () => {
  test('should render basic message context', async () => {
    const template = '<MessageContext description="Test context">Context content</MessageContext>';
    const result = await testComponent(template);
    expect(result).toContain('**Context**: Test context');
    expect(result).toContain('**Content**: Context content');
  });

  test('should render message context with html syntax', async () => {
    const template = '<MessageContext description="Test context" syntax="html">Context content</MessageContext>';
    const result = await testComponent(template);
    expect(result).toContain('<h4>Context: Test context</h4>');
    expect(result).toContain('<p><strong>Content:</strong> Context content</p>');
  });

  test('should render message context with json syntax', async () => {
    const template = '<MessageContext description="Test context" syntax="json">Context content</MessageContext>';
    const result = await testComponent(template);
    expect(result).toContain('"type": "message-context"');
    expect(result).toContain('"description": "Test context"');
  });
});