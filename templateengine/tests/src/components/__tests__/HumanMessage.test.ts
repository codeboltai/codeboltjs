import { testComponent } from './test-utils';

describe('HumanMessage Component', () => {
  test('should render basic human message', async () => {
    const template = '<HumanMessage name="Alice">This is a human message</HumanMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**Alice**: This is a human message');
  });

  test('should render human message with user ID', async () => {
    const template = '<HumanMessage name="Alice" userId="123">This is a human message</HumanMessage>';
    const result = await testComponent(template);
    expect(result).toContain('**Alice** (123): This is a human message');
  });

  test('should render human message with html syntax', async () => {
    const template = '<HumanMessage name="Alice" syntax="html">This is a human message</HumanMessage>';
    const result = await testComponent(template);
    expect(result).toContain('<strong>Alice</strong>');
  });

  test('should render human message with json syntax', async () => {
    const template = '<HumanMessage name="Alice" syntax="json">This is a human message</HumanMessage>';
    const result = await testComponent(template);
    expect(result).toContain('"type": "human-message"');
    expect(result).toContain('"name": "Alice"');
  });
});