import { testComponent } from './test-utils';

describe('Table Component', () => {
  test('should render basic table with headers and rows', async () => {
    const template = '<Table headers={["Name", "Age"]} rows={[["Alice", "30"], ["Bob", "25"]]} />';
    const result = await testComponent(template);
    expect(result).toContain('| Name | Age |');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('| Alice | 30 |');
    expect(result).toContain('| Bob | 25 |');
  });

  test('should render table with caption', async () => {
    const template = '<Table headers={["Name", "Age"]} rows={[["Alice", "30"]]} caption="User Data" />';
    const result = await testComponent(template);
    expect(result).toContain('Table: User Data');
  });

  test('should render table with html syntax', async () => {
    const template = '<Table headers={["Name", "Age"]} rows={[["Alice", "30"]]} syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<table>');
    expect(result).toContain('<th>Name</th>');
    expect(result).toContain('<th>Age</th>');
    expect(result).toContain('<td>Alice</td>');
    expect(result).toContain('<td>30</td>');
  });

});