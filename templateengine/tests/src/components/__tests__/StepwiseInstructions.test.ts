import { testComponent } from './test-utils';

describe('StepwiseInstructions Component', () => {
  test('should render basic instructions', async () => {
    const template = '<StepwiseInstructions title="Setup Guide" steps={["Step 1", "Step 2"]} />';
    const result = await testComponent(template);
    expect(result).toContain('INSTRUCTIONS: Setup Guide');
    expect(result).toContain('1. Step 1');
    expect(result).toContain('2. Step 2');
  });

  test('should render instructions with description', async () => {
    const template = '<StepwiseInstructions title="Setup Guide" description="How to set up the system" steps={["Step 1", "Step 2"]} />';
    const result = await testComponent(template);
    expect(result).toContain('How to set up the system');
  });

  test('should render unnumbered steps', async () => {
    const template = '<StepwiseInstructions title="Setup Guide" steps={["Step 1", "Step 2"]} numbered={false} />';
    const result = await testComponent(template);
    expect(result).toContain('- Step 1');
    expect(result).toContain('- Step 2');
  });

  test('should render instructions with html syntax', async () => {
    const template = '<StepwiseInstructions title="Setup Guide" steps={["Step 1", "Step 2"]} syntax="html" />';
    const result = await testComponent(template);
    expect(result).toContain('<div class="instructions">');
    expect(result).toContain('<h1>Setup Guide</h1>');
    expect(result).toContain('<ol>');
    expect(result).toContain('<li>Step 1</li>');
    expect(result).toContain('<li>Step 2</li>');
  });

  test('should render instructions with json syntax', async () => {
    const template = '<StepwiseInstructions title="Setup Guide" steps={["Step 1", "Step 2"]} syntax="json" />';
    const result = await testComponent(template);
    expect(result).toContain('"title": "Setup Guide"');
    expect(result).toContain('"steps": [\n    "Step 1",\n    "Step 2"\n  ]');
  });
});