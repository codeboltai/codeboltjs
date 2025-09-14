import { testComponent } from './test-utils';

describe('SubContent Component', () => {
  test('should render basic subcontent', async () => {
    const template = '<SubContent title="Section Title">Subcontent details</SubContent>';
    const result = await testComponent(template);
    expect(result).toContain('### Section Title');
    expect(result).toContain('Subcontent details');
  });

  test('should render subcontent without title', async () => {
    const template = '<SubContent>Subcontent details</SubContent>';
    const result = await testComponent(template);
    expect(result).toContain('Subcontent details');
  });

  test('should render subcontent with html syntax', async () => {
    const template = '<SubContent title="Section Title" syntax="html">Subcontent details</SubContent>';
    const result = await testComponent(template);
    expect(result).toContain('<h3>Section Title</h3>');
    expect(result).toContain('<div>');
  });

  test('should render subcontent with json syntax', async () => {
    const template = '<SubContent title="Section Title" syntax="json">Subcontent details</SubContent>';
    const result = await testComponent(template);
    expect(result).toContain('"type": "subcontent"');
    expect(result).toContain('"title": "Section Title"');
  });
});