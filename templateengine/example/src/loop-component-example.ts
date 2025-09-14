import { epomlparse } from 'epoml';

async function testLoopComponent() {
  console.log('=== EPOML Loop Component Example ===\n');

  // Test 1: Simple loop with array of strings
  console.log('Test 1: Simple loop with array of strings');
  const template1 = `
<Loop for="item in ['apple', 'banana', 'cherry']">
  Item: {{item}}
</Loop>
  `;
  
  try {
    const result1 = await epomlparse(template1);
    console.log(`Template: ${template1.trim()}`);
    console.log(`Result:\n${result1.trim()}\n`);
  } catch (error) {
    console.error('Error in test 1:', error);
  }
  
  console.log('---\n');

  // Test 2: Loop with array of objects
  console.log('Test 2: Loop with array of objects');
  const template2 = `
<Loop for="person in people">
  Name: {{person.name}}, Age: {{person.age}}
</Loop>
  `;
  
  const variables2 = {
    people: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ]
  };
  
  try {
    const result2 = await epomlparse(template2, variables2);
    console.log(`Template: ${template2.trim()}`);
    console.log(`Result:\n${result2.trim()}\n`);
  } catch (error) {
    console.error('Error in test 2:', error);
  }
  
  console.log('---\n');

  // Test 3: Loop with index variables
  console.log('Test 3: Loop with index variables');
  const template3 = `
<Loop for="item in items">
  Item {{loop.index}}: {{item}} (First: {{loop.first}}, Last: {{loop.last}})
</Loop>
  `;
  
  const variables3 = {
    items: ['first', 'second', 'third']
  };
  
  try {
    const result3 = await epomlparse(template3, variables3);
    console.log(`Template: ${template3.trim()}`);
    console.log(`Result:\n${result3.trim()}\n`);
  } catch (error) {
    console.error('Error in test 3:', error);
  }
  
  console.log('---\n');

  // Test 4: Nested loops
  console.log('Test 4: Nested loops');
  const template4 = `
<Loop for="category in categories">
  Category: {{category.name}}
  <Loop for="item in category.items">
    - {{item}}
  </Loop>
</Loop>
  `;
  
  const variables4 = {
    categories: [
      { name: 'Fruits', items: ['apple', 'banana'] },
      { name: 'Vegetables', items: ['carrot', 'broccoli'] }
    ]
  };
  
  try {
    const result4 = await epomlparse(template4, variables4);
    console.log(`Template: ${template4.trim()}`);
    console.log(`Result:\n${result4.trim()}\n`);
  } catch (error) {
    console.error('Error in test 4:', error);
  }
}

// Run the test
testLoopComponent().catch(console.error);