import { testComponent } from './test-utils';

describe('Introducer Component', () => {
  test('should render basic introducer', async () => {
    const template = '<Introducer text="This is an introduction" />';
    const result = await testComponent(template);
    console.log("Result: ", result);
    expect(result).toContain('# 💼 Introduction');
    expect(result).toContain('This is an introduction');
  });

  test('should render introducer with name and role', async () => {
    const template = '<Introducer name="John Doe" role="Developer" text="This is an introduction" />';
    const result = await testComponent(template);
    expect(result).toContain('**John Doe, Developer**');
  });

  test('should render introducer with purpose', async () => {
    const template = '<Introducer text="This is an introduction" purpose="Demo" />';
    const result = await testComponent(template);
    expect(result).toContain('*Purpose: Demo*');
  });

  test('should render introducer with different tones', async () => {
    const template1 = '<Introducer text="This is an introduction" tone="formal" />';
    const result1 = await testComponent(template1);
    expect(result1).toContain('# 🎩 Introduction');

    const template2 = '<Introducer text="This is an introduction" tone="casual" />';
    const result2 = await testComponent(template2);
    expect(result2).toContain('# 😊 Introduction');
  });

  test('should render introducer with html syntax', async () => {
    const template = '<Introducer text="This is an introduction" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="introducer">');
    expect(result).toContain('<h1>💼 Introduction</h1>');
  });
});