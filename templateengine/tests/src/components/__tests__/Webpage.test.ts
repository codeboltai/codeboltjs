import { testComponent } from './test-utils';

describe('Webpage Component', () => {
  test('should render basic webpage', async () => {
    const template = '<Webpage url="https://example.com" title="Example">Webpage content</Webpage>';
    const result = await testComponent(template);
    expect(result).toContain('🌐 [Example](https://example.com)');
    expect(result).toContain('Webpage content');
  });

  test('should render webpage without title', async () => {
    const template = '<Webpage url="https://example.com">Webpage content</Webpage>';
    const result = await testComponent(template);
    expect(result).toContain('🌐 [https://example.com](https://example.com)');
  });

  test('should render webpage with selector', async () => {
    const template = '<Webpage url="https://example.com" selector=".content">Webpage content</Webpage>';
    const result = await testComponent(template);
    expect(result).toContain('(Selector: `.content`)');
  });

  test('should render webpage with text only flag', async () => {
    const template = '<Webpage url="https://example.com" extractText={true}>Webpage content</Webpage>';
    const result = await testComponent(template);
    expect(result).toContain('(Text Only)');
  });

  test('should render webpage with html syntax', async () => {
    const template = '<Webpage url="https://example.com" syntax="html">Webpage content</Webpage>';
    const result = await testComponent(template);
    expect(result).toContain('<h3>🌐 <a href="https://example.com">');
    expect(result).toContain('<div class="webpage-content">');
  });
});