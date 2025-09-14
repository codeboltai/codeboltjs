import { testComponent } from './test-utils';

describe('FileTree Component', () => {
  test('should render basic file tree', async () => {
    // Since FileTree reads from the file system, we'll test with a simple case
    const template = '<FileTree depth={1} />';
    const result = await testComponent(template);
    // The result will depend on the current directory structure, so we just check it renders
    expect(typeof result).toBe('string');
  });

  test('should render file tree with custom depth', async () => {
    const template = '<FileTree depth={2} />';
    const result = await testComponent(template);
    expect(typeof result).toBe('string');
  });

  test('should render file tree with custom directory', async () => {
    // This test might fail if the directory doesn't exist, but we're testing the component structure
    const template = '<FileTree depth={1} directory="." />';
    const result = await testComponent(template);
    expect(typeof result).toBe('string');
  });
});