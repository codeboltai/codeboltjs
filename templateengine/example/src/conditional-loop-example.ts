import { epomlparse } from 'epoml';

async function testConditionalAndLoopRendering() {
  console.log('Testing conditional and loop rendering...\n');

  // Test 1: Paragraph with if condition (true)
  console.log('Test 1: Paragraph with if condition (true)');
  const template1 = `<Paragraph if={true}>This should render</Paragraph>`;
  const result1 = await epomlparse(template1);
  console.log(result1);
  console.log('---\n');

  // Test 2: Paragraph with if condition (false)
  console.log('Test 2: Paragraph with if condition (false)');
  const template2 = `<Paragraph if={false}>This should not render</Paragraph>`;
  const result2 = await epomlparse(template2);
  console.log(result2);
  console.log('---\n');

  // Test 3: Paragraph with for loop (with variables)
  console.log('Test 3: Paragraph with for loop (with variables)');
  const template3 = `<Paragraph for="item in items">{{item}} </Paragraph>`;
  const variables3 = { items: ['apple', 'banana', 'cherry'] };
  const result3 = await epomlparse(template3, variables3);
  console.log(result3);
  console.log('---\n');

  // Test 4: ListItem with if condition
  console.log('Test 4: ListItem with if condition');
  const template4 = `<ListItem if={true}>Visible item</ListItem>`;
  const result4 = await epomlparse(template4);
  console.log(result4);
  console.log('---\n');

  // Test 5: ListItem with for loop (with variables)
  console.log('Test 5: ListItem with for loop (with variables)');
  const template5 = `<ListItem for="num in numbers">Item {{num}}</ListItem>`;
  const variables5 = { numbers: [1, 2, 3] };
  const result5 = await epomlparse(template5, variables5);
  console.log(result5);
  console.log('---\n');

  // Test 6: Example component with if condition
  console.log('Test 6: Example component with if condition');
  const template6 = `<Example if={true} title="Conditional Example">This example should render</Example>`;
  const result6 = await epomlparse(template6);
  console.log(result6);
  console.log('---\n');

  // Test 7: Example component with for loop (with variables)
  console.log('Test 7: Example component with for loop (with variables)');
  const template7 = `<Example for="demo in demos" title="Example {{loop.index}}">Content {{demo}}</Example>`;
  const variables7 = { demos: ['demo1', 'demo2'] };
  const result7 = await epomlparse(template7, variables7);
  console.log(result7);
  console.log('---\n');

  // Test 8: Conditional rendering with variables
  console.log('Test 8: Conditional rendering with variables');
  const template8 = `<Paragraph if={isVisible}>Conditional content</Paragraph>`;
  const variables8 = { isVisible: true };
  const result8 = await epomlparse(template8, variables8);
  console.log(result8);
  console.log('---\n');

  // Test 9: Loop rendering with variables and loop context
  console.log('Test 9: Loop rendering with variables and loop context');
  const template9 = `<Paragraph for="item in items">Item: {{item}}, Index: {{loop.index}}, First: {{loop.first}}, Last: {{loop.last}}</Paragraph>`;
  const variables9 = { items: ['first', 'second', 'third'] };
  const result9 = await epomlparse(template9, variables9);
  console.log(result9);
  console.log('---\n');
}

// Run the tests
testConditionalAndLoopRendering().catch(console.error);