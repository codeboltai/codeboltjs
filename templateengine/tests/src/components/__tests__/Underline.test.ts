import { testComponent } from './test-utils';

describe('Underline Component', () => {
  test('should render underlined text with markdown syntax', async () => {
    const template = '<Underline>This is underlined text</Underline>';
    const result = await testComponent(template);
    expect(result).toContain('<u>This is underlined text</u>');
  });

  test('should render underlined text with html syntax', async () => {
    const template = '<Underline syntax="html">This is underlined text</Underline>';
    const result = await testComponent(template);
    expect(result).toContain('<u>This is underlined text</u>');
  });

  test('should render underlined text with custom class', async () => {
    const template = '<Underline className="custom-underline">This is underlined text</Underline>';
    const result = await testComponent(template);
    expect(result).toContain('<u>This is underlined text</u>');
  });
});