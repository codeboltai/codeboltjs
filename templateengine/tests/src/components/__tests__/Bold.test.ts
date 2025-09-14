import { testComponent } from './test-utils';

describe('Bold Component', () => {
  test('should render bold text with markdown syntax', async () => {
    const template = '<Bold>This is bold text</Bold>';
    const result = await testComponent(template);
    expect(result).toContain('**This is bold text**');
  });


  test('should render bold text with text syntax', async () => {
    const template = '<Bold syntax="text">This is bold text</Bold>';
    const result = await testComponent(template);
    expect(result).toContain('THIS IS BOLD TEXT');
  });

  test('should render bold text with custom class', async () => {
    const template = '<Bold className="custom-bold">This is bold text</Bold>';
    const result = await testComponent(template);
    expect(result).toContain('**This is bold text**');
  });
});