import { testComponent } from './test-utils';

describe('Question Component', () => {
  test('should render basic question', async () => {
    const template = '<Question text="What is EPOML?" />';
    const result = await testComponent(template);
    expect(result).toContain('## 🟡 Question');
    expect(result).toContain('**What is EPOML?**');
  });

  test('should render question with options', async () => {
    const template = '<Question text="What is EPOML?" type="multiple-choice" options={["A", "B", "C"]} />';
    const result = await testComponent(template);
    expect(result).toContain('### Options');
    expect(result).toContain('A. A');
    expect(result).toContain('B. B');
    expect(result).toContain('C. C');
  });

  test('should render question with answer', async () => {
    const template = '<Question text="What is EPOML?" answer="A markup language" />';
    const result = await testComponent(template);
    expect(result).toContain('### Answer');
    expect(result).toContain('- A markup language');
  });

  test('should render question with explanation', async () => {
    const template = '<Question text="What is EPOML?" explanation="EPOML stands for Enhanced Plain Old Markup Language" />';
    const result = await testComponent(template);
    expect(result).toContain('### Explanation');
    expect(result).toContain('EPOML stands for Enhanced Plain Old Markup Language');
  });

  test('should render question with different difficulty levels', async () => {
    const template1 = '<Question text="What is EPOML?" difficulty="easy" />';
    const result1 = await testComponent(template1);
    expect(result1).toContain('🟢');

    const template2 = '<Question text="What is EPOML?" difficulty="hard" />';
    const result2 = await testComponent(template2);
    expect(result2).toContain('🔴');
  });

  test('should render question with html syntax', async () => {
    const template = '<Question text="What is EPOML?" syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="question">');
    expect(result).toContain('<p class="question-text"><strong>What is EPOML?</strong></p>');
  });
});