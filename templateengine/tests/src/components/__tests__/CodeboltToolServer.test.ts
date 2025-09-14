import { testComponent } from './test-utils';

describe('CodeboltToolServer Component', () => {
  test('should render basic tool server', async () => {
    const template = '<CodeboltToolServer />';
    const result = await testComponent(template);
    expect(result).toContain('## 🛠️ Codebolt Tool Servers');
  });

  test('should render tool server with server names', async () => {
    const template = '<CodeboltToolServer toolServerNames={["Server1", "Server2"]} />';
    const result = await testComponent(template);
    expect(result).toContain('### Available Tool Servers:');
    expect(result).toContain('1. **Server1**');
    expect(result).toContain('2. **Server2**');
  });

  test('should render tool server with tool calls', async () => {
    const template = '<CodeboltToolServer>Tool call details</CodeboltToolServer>';
    const result = await testComponent(template);
    expect(result).toContain('### Tool Calls:');
    expect(result).toContain('Tool call details');
  });

  test('should render tool server with html syntax', async () => {
    const template = '<CodeboltToolServer syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="codebolt-tool-server">');
    expect(result).toContain('<h2>🛠️ Codebolt Tool Servers</h2>');
  });

  test('should render tool server with json syntax', async () => {
    const template = '<CodeboltToolServer toolServerNames={["Server1"]} syntax="json" />';
    const result = await testComponent(template);
    expect(result).toContain('"type": "codebolt-tool-server"');
    expect(result).toContain('"toolServers": [\
    "Server1"\
  ]');
  });
});