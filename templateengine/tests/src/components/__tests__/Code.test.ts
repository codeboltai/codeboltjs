import { testComponent } from './test-utils';

describe('Code Component', () => {
  test('should render inline code with default settings', async () => {
    const template = '<Code inline={true}>const x = 1;</Code>';
    const result = await testComponent(template);
    expect(result).toContain('```const x = 1;```');
  });

  test('should render block code with language', async () => {
    const template = '<Code lang="javascript">const x = 1;</Code>';
    const result = await testComponent(template);
    expect(result).toContain('```const x = 1;```');
  });


  test('should render block code with language', async () => {
    const template = '<Code lang="javascript" inline={false}>const x = 1;</Code>';
    const result = await testComponent(template);
    expect(result).toContain('```javascript');
    expect(result).toContain('const x = 1;');
  });

  // test('should render code with html syntax', async () => {
  //   const template = '<Code lang="javascript" syntax="html">const x = 1;</Code>';
  //   const result = await testComponent(template);
  //   expect(result).toContain('<code');
  // });

  test('should render code with custom class', async () => {
    const template = '<Code lang="javascript" className="highlight" inline={false}>const x = 1;</Code>';
    const result = await testComponent(template);
    expect(result).toContain('```javascript');
  });
});