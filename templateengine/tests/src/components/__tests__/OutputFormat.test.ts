import { testComponent } from './test-utils';

describe('OutputFormat Component', () => {
  test('should render basic output format', async () => {
    const template = '<OutputFormat type="json" description="JSON format" />';
    const result = await testComponent(template);
    expect(result).toContain('## Output Format: json');
    expect(result).toContain('**Description:** JSON format');
  });

  test('should render output format with example', async () => {
    const template = '<OutputFormat type="json" description="JSON format" example={`{"key": "value"}`} />';
    const result = await testComponent(template);
    expect(result).toContain('### Example\n\n```json\n{"key": "value"}\n```');
  });

  test('should render output format with schema', async () => {
    const template = '<OutputFormat type="json" description="JSON format" schema={schemaObj} />';
    const result = await testComponent(template, { schemaObj: { type: "object" } });
    expect(result).toContain('### Schema\n\n```json\n{\n  "type": "object"\n}\n```');
  });

  test('should render preferred output format', async () => {
    const template = '<OutputFormat type="json" description="JSON format" preferred={true} />';
    const result = await testComponent(template);
    expect(result).toContain('🌟 (Preferred)');
  });

  test('should render output format with html syntax', async () => {
    const template = '<OutputFormat type="json" description="JSON format" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="output-format">');
    expect(result).toContain('<h2>Output Format: json</h2>');
  });
});