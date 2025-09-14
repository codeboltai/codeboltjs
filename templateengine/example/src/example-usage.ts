import { epomlparse } from 'epoml';

/**
 * This example demonstrates the proper way to use the Code component
 * with complex JavaScript code blocks using template variables.
 * 
 * Key lessons:
 * 1. Use template variables ({variableName}) for complex code to avoid JSX parsing conflicts
 * 2. Wrap multiple JSX elements in a container (div) to prevent parsing issues
 * 3. The Bold and Code components work together seamlessly
 */

async function exampleUsage() {
  //  // Test with your requested function using variables
  // console.log('Testing with your function using variables:');
  // const jsCode = 'function greet(name) { return `Hello, ${name}!`; }';
  // const functionTemplate = `<Code inline={false} lang="javascript">{code}</Code>`;
  // const functionResult = await epomlparse(functionTemplate, { code: jsCode });
  // console.log('Function Template:', functionTemplate);
  // console.log('Function Result:', functionResult);
  // console.log('---');

  // const template = `<ExampleSet title="Test Examples" description="These are test examples">
  //   <Example title="Test Example">
  //     <ExampleInput label="Test Input">Input content</ExampleInput>
  //     <ExampleInput label="Test Input" format="javascript" inline={false}>const x = 1;</ExampleInput>
  //     <ExampleOutput label="Test Output">Output content</ExampleOutput>
  //   </Example>
  // </ExampleSet>`;
    // const template = `<ExampleInput label="Test Input">Input content</ExampleInput>`;
  const template = `<DataObject data='{"status": "active", "version": "1.0.0"}' name="Status" inline={true} />`;
  // const template = `<Audio src="../../public/song.mp3" alt="Song audio"/>`
  const result = await epomlparse(template);
  console.log("Result: \n\n", result);
}

exampleUsage().catch(console.error);