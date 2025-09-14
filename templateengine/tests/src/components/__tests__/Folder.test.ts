import { testComponent } from './test-utils';

describe('Folder Component', () => {
  test('should render basic folder', async () => {
    const template = '<Folder name="Test Folder"/>';
    const result = await testComponent(template);
    expect(result).toContain('📁 Test Folder');
  });

  test('should render folder with path', async () => {
    const template = '<Folder name="Test Folder" path="/test/path" />';
    const result = await testComponent(template);
    expect(result).toContain('📁 Test Folder');
  });

  test('should render folder with html syntax', async () => {
    const template = '<Folder name="Test Folder" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<h3>📁 Test Folder</h3>');
  });

  test('should render folder with json syntax', async () => {
    const template = '<Folder name="Test Folder" syntax="json" />';
    const result = await testComponent(template);
    expect(result).toContain('"type": "folder"');
    expect(result).toContain('"name": "Test Folder"');
  });
});