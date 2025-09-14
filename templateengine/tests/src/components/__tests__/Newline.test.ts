import { testComponent } from './test-utils';

describe('Newline Component', () => {
  test('should render single newline', async () => {
    const template = '<Newline />';
    const result = await testComponent(template);
    expect(result).toBe('\n');
  });

  test('should render multiple newlines', async () => {
    const template = '<Newline count={3} />';
    const result = await testComponent(template);
    expect(result).toBe('\n\n\n');
  });

  test('should render newline with html syntax', async () => {
    const template = '<Newline syntax="html" />';
    const result = await testComponent(template);
    expect(result).toBe('<br>');
  });

  test('should render multiple newlines with html syntax', async () => {
    const template = '<Newline syntax="html" count={2} />';
    const result = await testComponent(template);
    expect(result).toBe('<br><br>');
  });
});