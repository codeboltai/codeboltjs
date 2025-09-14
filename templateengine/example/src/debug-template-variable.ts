import { epomlparse } from 'epoml';

async function debugTemplateVariable() {
  console.log('Debugging template variables...\n');

  // Simple test with a variable
  console.log('Test 1: Simple variable substitution');
  const template1 = `<Paragraph>{name}</Paragraph>`;
  const variables1 = { name: 'John' };
  const result1 = await epomlparse(template1, variables1);
  console.log(`Template: ${template1}`);
  console.log(`Variables:`, variables1);
  console.log(`Result: "${result1}"`);
  console.log('---\n');

  // Test with loop variable
  console.log('Test 2: Loop variable substitution');
  const template2 = `<Paragraph for="item in items">{item}</Paragraph>`;
  const variables2 = { items: ['apple', 'banana'] };
  const result2 = await epomlparse(template2, variables2);
  console.log(`Template: ${template2}`);
  console.log(`Variables:`, variables2);
  console.log(`Result: "${result2}"`);
  console.log('---\n');
}

// Run the debug test
debugTemplateVariable().catch(console.error);