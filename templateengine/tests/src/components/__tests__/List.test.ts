import { testComponent } from './test-utils';

describe('List Component', () => {
  test('should render unordered list with default settings', async () => {
    const template = `
      <List>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    `;
    const result = await testComponent(template);
    expect(result).toContain('- First item');
    expect(result).toContain('- Second item');
  });

  test('should render ordered list', async () => {
    const template = `
      <List ordered={true}>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    `;
    const result = await testComponent(template);
    expect(result).toContain('1. First item');
    expect(result).toContain('2. Second item');
  });

  test('should render ordered list with custom start', async () => {
    const template = `
      <List ordered={true} start={5}>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    `;
    const result = await testComponent(template);
    expect(result).toContain('5. First item');
    expect(result).toContain('6. Second item');
  });

  test('should render list with html syntax', async () => {
    const template = `
      <List syntax="html">
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    `;
    const result = await testComponent(template);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>First item</li>');
  });
});