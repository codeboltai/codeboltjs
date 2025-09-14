import { testComponent } from './test-utils';

describe('DataObject Component', () => {
  test('should render basic data object', async () => {
    const template = '<DataObject data={testData} />';
    const result = await testComponent(template, { testData: { key: "value" } });
    expect(result).toContain('```json\n{\n  "key": "value"\n}\n```');
  });

  test('should render data object with name and type', async () => {
    const template = '<DataObject data={testData} name="TestObject" type="test" />';
    const result = await testComponent(template, { testData: { key: "value" } });
    expect(result).toContain('**TestObject**');
    expect(result).toContain('*Type: test*');
  });

  test('should render data object inline', async () => {
    const template = '<DataObject data={testData} inline={true} />';
    const result = await testComponent(template, { testData: { key: "value" } });
    expect(result).toContain('```{"key":"value"}```');
  });

  test('should render data object with html syntax', async () => {
    const template = '<DataObject data={testData} syntax="html" />';
    const result = await testComponent(template, { testData: { key: "value" } });
    expect(result).toContain('<pre><code>{\n  &quot;key&quot;: &quot;value&quot;\n}</code></pre>');
  });

  test('should render data object with json syntax', async () => {
    const template = '<DataObject data={testData} syntax="json" />';
    const result = await testComponent(template, { testData: { key: "value" } });
    expect(result).toContain('"data": {\n    "key": "value"\n  }');
  });

  test('should parse JSON string as data', async () => {
    const template = '<DataObject data=\'{"name": "John", "age": 30}\' />';
    const result = await testComponent(template);
    expect(result).toContain('```json\n{\n  "name": "John",\n  "age": 30\n}\n```');
  });

  test('should handle string format with single quotes inside', async () => {
    const template = `<DataObject data="{ key: 'value' }" />`;
    const result = await testComponent(template);
    expect(result).toContain('```json\n"{ key: \'value\' }"\n```');
  });
});