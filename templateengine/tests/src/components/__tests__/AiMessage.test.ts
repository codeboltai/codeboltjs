import { testComponent } from './test-utils';

describe('AiMessage Component', () => {
  test('should render basic AI message', async () => {
    const template = '<AiMessage>This is an AI message</AiMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**AI**: This is an AI message');
  });

  test('should render AI message with model information', async () => {
    const template = '<AiMessage model="GPT-4">This is an AI message</AiMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**AI** (GPT-4): This is an AI message');
  });

  test('should render AI message with confidence level', async () => {
    const template = '<AiMessage confidence={0.95}>This is an AI message</AiMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**AI** [95%]: This is an AI message');
  });

  test('should render AI message with html syntax', async () => {
    const template = '<AiMessage syntax="html" model="GPT-4">This is an AI message</AiMessage>';
    const result = await testComponent(template);
    expect(result).toContain('<strong>AI</strong>');
    expect(result).toContain('(GPT-4)');
  });
});