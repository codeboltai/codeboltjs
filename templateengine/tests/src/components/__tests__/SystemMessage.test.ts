import { testComponent } from './test-utils';

describe('SystemMessage Component', () => {
  test('should render basic system message', async () => {
    const template = '<SystemMessage>This is a system message</SystemMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**System**: This is a system message');
  });

  test('should render system message with message type', async () => {
    const template = '<SystemMessage messageType="warning">This is a system message</SystemMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**System** [warning]: This is a system message');
  });

  test('should render system message with priority', async () => {
    const template = '<SystemMessage priority="high">This is a system message</SystemMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**System** (high): This is a system message');
  });

  test('should render system message with html syntax', async () => {
    const template = '<SystemMessage syntax="html" priority="high">This is a system message</SystemMessage>';
    const result = await testComponent(template);
    expect(result).toContain('<strong>System</strong>');
    expect(result).toContain('(high)');
  });
});