const { epomlparse } = require('./dist/index.js');

async function testRawText() {
  console.log('=== Testing RawText with new syntax ===');
  
  const testPrompt = `<RawText>
<example>
user: 1 + 2
model: 3
</example>
</RawText>`;
  
  console.log('Input prompt:');
  console.log(testPrompt);
  console.log('\n--- Processing ---\n');
  
  try {
    const result = await epomlparse(testPrompt);
    console.log('Final Result:');
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRawText();
