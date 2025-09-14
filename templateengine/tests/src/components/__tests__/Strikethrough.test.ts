import { testComponent } from './test-utils';

describe('Strikethrough Component', () => {
  test('should render strikethrough text with markdown syntax', async () => {
    const template = '<Strikethrough>This is strikethrough text</Strikethrough>';
    const result = await testComponent(template);
    expect(result).toContain('~~This is strikethrough text~~');
  });

  test('should render strikethrough text with custom class', async () => {
    const template = '<Strikethrough className="custom-strike">This is strikethrough text</Strikethrough>';
    const result = await testComponent(template);
    expect(result).toContain('~~This is strikethrough text~~');
  });
});