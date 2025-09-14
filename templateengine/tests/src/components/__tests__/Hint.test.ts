import { testComponent } from './test-utils';

describe('Hint Component', () => {
  test('should render basic hint', async () => {
    const template = '<Hint text="This is a hint" type="tip" />';
    const result = await testComponent(template);
    expect(result).toContain('> 💡 **Tip**');
    expect(result).toContain('> This is a hint');
  });

  test('should render hint with different types', async () => {
    const template1 = '<Hint text="This is a warning" type="warning" />';
    const result1 = await testComponent(template1);
    expect(result1).toContain('> ⚠️ **Warning**');

    const template2 = '<Hint text="This is a note" type="note" />';
    const result2 = await testComponent(template2);
    expect(result2).toContain('> 📝 **Note**');
  });

  test('should render hint with title and topic', async () => {
    const template = '<Hint text="This is a hint" type="tip" title="Custom Title" topic="Testing" />';
    const result = await testComponent(template);
    expect(result).toContain('> 💡 **Custom Title**');
    expect(result).toContain('> *Topic: Testing*');
  });

  test('should render hint with html syntax', async () => {
    const template = '<Hint text="This is a hint" type="tip" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="hint hint--tip">');
    expect(result).toContain('<span class="hint-icon">💡</span>');
  });
});