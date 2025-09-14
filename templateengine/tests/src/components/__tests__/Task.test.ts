import { testComponent } from './test-utils';

describe('Task Component', () => {
  test('should render basic task', async () => {
    const template = '<Task title="Test Task" description="This is a test task" />';
    const result = await testComponent(template);
    expect(result).toContain('## ⏳ 🔸 Test Task');
    expect(result).toContain('**Description:** This is a test task');
    expect(result).toContain('**Status:** pending');
    expect(result).toContain('**Priority:** medium');
  });

  test('should render task with ID', async () => {
    const template = '<Task id="123" title="Test Task" />';
    const result = await testComponent(template);
    expect(result).toContain('(123)');
  });

  test('should render task with different status', async () => {
    const template = '<Task title="Test Task" status="completed" />';
    const result = await testComponent(template);
    expect(result).toContain('✅');
  });

  test('should render task with different priority', async () => {
    const template = '<Task title="Test Task" priority="high" />';
    const result = await testComponent(template);
    expect(result).toContain('🔺');
  });

  test('should render task with assignee and due date', async () => {
    const template = '<Task title="Test Task" assignee="Alice" dueDate="2023-12-31" />';
    const result = await testComponent(template);
    expect(result).toContain('**Assignee:** Alice');
    expect(result).toContain('**Due Date:** 2023-12-31');
  });

  test('should render blocked task', async () => {
    const template = '<Task title="Test Task" blocked={true} />';
    const result = await testComponent(template);
    expect(result).toContain('**Blocked:** Yes');
  });

  test('should render task with html syntax', async () => {
    const template = '<Task title="Test Task" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="task">');
    expect(result).toContain('<h2>⏳ 🔸 Test Task</h2>');
  });
});