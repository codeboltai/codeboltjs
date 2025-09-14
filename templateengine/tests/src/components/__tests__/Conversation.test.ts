import { testComponent } from './test-utils';

describe('Conversation Component', () => {
  test('should render basic conversation', async () => {
    const template = '<Conversation title="Test Chat">Conversation content</Conversation>';
    const result = await testComponent(template);
    expect(result).toContain('### Test Chat');
    expect(result).toContain('Conversation content');
  });

  test('should render conversation with participants', async () => {
    const template = '<Conversation title="Test Chat" participants={["Alice", "Bob"]}>Conversation content</Conversation>';
    const result = await testComponent(template);
    expect(result).toContain('**Participants:** Alice, Bob');
  });

  test('should render conversation with html syntax', async () => {
    const template = '<Conversation title="Test Chat" syntax="html">Conversation content</Conversation>';
    const result = await testComponent(template);
    expect(result).toContain('<h3>Test Chat</h3>');
    expect(result).toContain('<div class="conversation-content">');
  });

  test('should render conversation with json syntax', async () => {
    const template = '<Conversation title="Test Chat" syntax="json">Conversation content</Conversation>';
    const result = await testComponent(template);
    expect(result).toContain('"type": "conversation"');
    expect(result).toContain('"title": "Test Chat"');
  });
});