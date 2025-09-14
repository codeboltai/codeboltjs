import { epomlparse } from 'epoml';

async function demonstrateTemplateVariables() {
  console.log('=== EPOML Template Variables Demo ===\n');

  // Example 1: Basic text substitution
  console.log('Example 1: Basic text substitution');
  const template1 = `<p>My name is {name}</p>`;
  const result1 = await epomlparse(template1, { name: "Alice" });
  console.log(`Template: ${template1}`);
  console.log(`Result: ${result1.trim()}\n`);

  // Example 2: FileTree with variable directory
  console.log('Example 2: FileTree with variable directory');
  const template2 = `<FileTree directory={treepath} depth={1} />`;
  const result2 = await epomlparse(template2, { treepath: "./src/components" });
  console.log(`Template: ${template2}`);
  console.log(`Result preview:\n${result2.substring(0, 200)}...\n`);

  // Example 3: Multiple variables
  console.log('Example 3: Multiple variables in complex template');
  const template3 = `
<div>
  <p>Project: {projectName}</p>
  <p>Author: {author}</p>
  <p>Version: {version}</p>
  <list>
    <item>Language: {language}</item>
    <item>Platform: {platform}</item>
  </list>
</div>`;

  const variables3 = {
    projectName: "EPOML",
    author: "Team",
    version: "2.0.0",
    language: "TypeScript",
    platform: "Node.js"
  };

  const result3 = await epomlparse(template3, variables3);
  console.log(`Variables: ${JSON.stringify(variables3, null, 2)}`);
  console.log(`Result:\n${result3}`);
}

// Run demo
demonstrateTemplateVariables().catch(console.error);