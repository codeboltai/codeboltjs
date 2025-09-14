import { epomlparse } from 'epoml';

async function testLoopFunctionality() {
  console.log('=== EPOML Loop Functionality Test ===\n');

  // Test 1: CodeboltToolServer with for loop
  console.log('Test 1: CodeboltToolServer with for loop');
  const loopTemplate = `
<CodeboltToolServer for="server in ['Server1', 'Server2', 'Server3']">
  Processing server: {{server}}
</CodeboltToolServer>
  `;
  
  try {
    const loopResult = await epomlparse(loopTemplate);
    console.log(`Template: ${loopTemplate.trim()}`);
    console.log(`Result:\n${loopResult.trim()}\n`);
  } catch (error) {
    console.error('Error in loop test:', error);
  }
  
  console.log('---\n');

  // Test 2: Simple variable substitution
  console.log('Test 2: Simple variable substitution');
  const variableTemplate = `
<CodeboltToolServer toolServerNames={["{{serverName}}"]}>
  Server: {{serverName}}
</CodeboltToolServer>
  `;
  
  try {
    const variableResult = await epomlparse(variableTemplate, { serverName: 'MyServer' });
    console.log(`Template: ${variableTemplate.trim()}`);
    console.log(`Result:\n${variableResult.trim()}\n`);
  } catch (error) {
    console.error('Error in variable test:', error);
  }
}

// Run the test
testLoopFunctionality().catch(console.error);