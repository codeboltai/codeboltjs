import { testComponent } from './test-utils';

describe('Role Component', () => {
  test('should render basic role', async () => {
    const template = '<Role name="Admin" />';
    const result = await testComponent(template);
    expect(result).toContain('# ✅ Role: Admin');
  });

  test('should render role with description', async () => {
    const template = '<Role name="Admin" description="Administrator role" />';
    const result = await testComponent(template);
    expect(result).toContain('**Description:** Administrator role');
  });

  test('should render role with responsibilities', async () => {
    const template = '<Role name="Admin" responsibilities={["Manage users", "Configure system"]} />';
    const result = await testComponent(template);
    expect(result).toContain('## Responsibilities');
    expect(result).toContain('- Manage users');
    expect(result).toContain('- Configure system');
  });

  test('should render role with permissions', async () => {
    const template = '<Role name="Admin" permissions={["read", "write", "delete"]} />';
    const result = await testComponent(template);
    expect(result).toContain('## Permissions');
    expect(result).toContain('- read');
    expect(result).toContain('- write');
    expect(result).toContain('- delete');
  });

  test('should render inactive role', async () => {
    const template = '<Role name="Admin" active={false} />';
    const result = await testComponent(template);
    expect(result).toContain('# ❌ Role: Admin');
  });

  test('should render role with html syntax', async () => {
    const template = '<Role name="Admin" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="role">');
    expect(result).toContain('<h1>✅ Role: Admin</h1>');
  });
});