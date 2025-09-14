import { testComponent } from './test-utils';

describe('Header Component', () => {
  test('should render header with default level', async () => {
    const template = '<Header>Test Header</Header>';
    const result = await testComponent(template);
    expect(result).toContain('# Test Header');
  });

  test('should render header with specific level', async () => {
    const template = '<Header level={2}>Test Header</Header>';
    const result = await testComponent(template);
    expect(result).toContain('## Test Header');
  }); 

  test('should render header with custom class', async () => {
    const template = '<Header className="custom-header">Test Header</Header>';
    const result = await testComponent(template);
    expect(result).toContain('# Test Header');
  });
});