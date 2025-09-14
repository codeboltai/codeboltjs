import { testComponent } from './test-utils';

describe('Inline Component', () => {
  test('should render basic inline content', async () => {
    const template = '<Inline>This is inline content</Inline>';
    const result = await testComponent(template);
    expect(result).toContain('This is inline content');
  });

  test('should render inline content with json syntax', async () => {
    const template = '<Inline syntax="json">This is inline content</Inline>';
    const result = await testComponent(template);
    expect(result).toContain('"This is inline content"');
  });

  test('should render inline content with custom class', async () => {
    const template = '<Inline className="custom-inline">This is inline content</Inline>';
    const result = await testComponent(template);
    expect(result).toContain('This is inline content');
  });
});