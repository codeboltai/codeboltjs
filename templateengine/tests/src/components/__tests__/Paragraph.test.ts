import { testComponent } from './test-utils';

describe('Paragraph Component', () => {
  test('should render basic paragraph', async () => {
    const template = '<Paragraph>This is a paragraph</Paragraph>';
    const result = await testComponent(template);
    expect(result).toContain('This is a paragraph');
  });


  test('should render paragraph with custom class', async () => {
    const template = '<Paragraph className="custom-paragraph">This is a paragraph</Paragraph>';
    const result = await testComponent(template);
    expect(result).toContain('This is a paragraph');
  });

  test('should render paragraph with template variables', async () => {
    const template = '<Paragraph>Hello {name}!</Paragraph>';
    const result = await testComponent(template, { name: 'World' });
    expect(result).toContain('Hello World!');
  });
});