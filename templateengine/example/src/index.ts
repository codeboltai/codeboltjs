import { epomlparse, registerComponent } from 'epoml';

// Define a custom Task component
function Task({ children }: { children: string }) {
  return `# ${children}\n`;
}

async function main() {
  console.log('=== EPOML Example - Custom Component ===\n');
  
  // Register custom component
  registerComponent('Task', Task);

  // Use custom component
  const prompt = `
<Task>Task1</Task>
`;

  try {
    const output = await epomlparse(prompt);
    console.log('Input:', prompt);
    console.log('Output:', output);
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}