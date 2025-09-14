import { epomlparse } from 'epoml';

async function testTemplateVariables() {
  console.log('Testing template variables functionality...\n');

  // Test 1: Simple variable substitution
  console.log('Test 1: Simple variable substitution');
  const template1 = `<p>My name is {name}</p>`;
  try {
    const result1 = await epomlparse(template1, { name: "Alice" });
    console.log('Template:', template1);
    console.log('Variables:', JSON.stringify({ name: "Alice" }));
    console.log('Result:', result1);
    console.log('✓ Test 1 passed\n');
  } catch (error) {
    console.error('✗ Test 1 failed:', error);
  }

  // Test 2: FileTree component with directory variable
  console.log('Test 2: FileTree component with directory variable');
  const template2 = `<FileTree directory={treepath} depth={2} />`;
  try {
    const result2 = await epomlparse(template2, { treepath: "./src", depth: 2 });
    console.log('Template:', template2);
    console.log('Variables:', JSON.stringify({ treepath: "./src", depth: 2 }));
    console.log('Result preview (first 200 chars):', result2.substring(0, 200) + '...');
    console.log('✓ Test 2 passed\n');
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
  }

  // Test 3: Multiple variables in a paragraph
  console.log('Test 3: Multiple variables in a paragraph');
  const template3 = `<p>Hello {greeting}, my name is {name} and I am {age} years old.</p>`;
  try {
    const result3 = await epomlparse(template3, { 
      greeting: "world", 
      name: "Bob", 
      age: 25 
    });
    console.log('Template:', template3);
    console.log('Variables:', JSON.stringify({ greeting: "world", name: "Bob", age: 25 }));
    console.log('Result:', result3);
    console.log('✓ Test 3 passed\n');
  } catch (error) {
    console.error('✗ Test 3 failed:', error);
  }

  // Test 4: No variables provided (should work normally)
  console.log('Test 4: No variables provided');
  const template4 = `<p>This is a static template</p>`;
  try {
    const result4 = await epomlparse(template4);
    console.log('Template:', template4);
    console.log('Variables: none');
    console.log('Result:', result4);
    console.log('✓ Test 4 passed\n');
  } catch (error) {
    console.error('✗ Test 4 failed:', error);
  }

  // Test 5: Complex template with list and variables
  console.log('Test 5: Complex template with list and variables');
  const template5 = `
    <div>
      <p>Project: {projectName}</p>
      <p>Version: {version}</p>
      <list>
        <item>Author: {author}</item>
        <item>Status: {status}</item>
      </list>
    </div>
  `;
  try {
    const result5 = await epomlparse(template5, { 
      projectName: "EPOML", 
      version: "1.0.0",
      author: "Developer",
      status: "Active"
    });
    console.log('Template:', template5.trim());
    console.log('Variables:', JSON.stringify({ 
      projectName: "EPOML", 
      version: "1.0.0",
      author: "Developer",
      status: "Active"
    }));
    console.log('Result:', result5);
    console.log('✓ Test 5 passed\n');
  } catch (error) {
    console.error('✗ Test 5 failed:', error);
  }

  console.log('All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTemplateVariables().catch(console.error);
}

export { testTemplateVariables };