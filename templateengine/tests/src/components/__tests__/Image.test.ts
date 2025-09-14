import { testComponent } from './test-utils';

describe('Image Component', () => {
  test('should render basic image with src', async () => {
    const template = '<Image src="test.jpg" alt="Test image" />';
    const result = await testComponent(template);
    expect(result).toContain('[IMAGE: Test image]');
  });

  test('should render image with base64 data', async () => {
    const template = '<Image base64="dGVzdCBpbWFnZQ==" alt="Test image" />';
    const result = await testComponent(template);
    expect(result).toContain('[IMAGE: Test image]');
  });

  test('should render image with caption', async () => {
    const template = '<Image src="test.jpg" alt="Test image" caption="Test caption" />';
    const result = await testComponent(template);
    expect(result).toContain('Caption: Test caption');
  });

  test('should render image with html syntax', async () => {
    const template = '<Image src="test.jpg" alt="Test image" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<img');
  });
});