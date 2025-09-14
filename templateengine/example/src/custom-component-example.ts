import { epomlparse, createElement, registerComponent, type Component } from 'epoml';

// Define a custom component using createElement
function Note({ title, children }: { title: string; children: (Component | string)[] }): Component {
  // Using createElement to create the component structure
  return createElement('div', {}, 
    createElement('p', {}, `📝 Note: ${title}`),
    createElement('p', {}, ...children)
  );
}

// Another custom component that creates a todo item
function Todo({ item, completed }: { item: string; completed?: boolean }): Component {
  const status = completed ? '✅' : '⏳';
  return createElement('p', {}, `${status} ${item}`);
}

// Register the custom components
registerComponent('Note', Note);
registerComponent('Todo', Todo);

async function demonstrateCustomComponents() {
  console.log('=== EPOML Custom Components Demo ===\n');

  // Example 1: Using the Note component
  console.log('Example 1: Note Component');
  const noteTemplate = `
    <Note title="Important">
      This is a very important note that you should read carefully.
    </Note>
  `;
  
  try {
    const noteResult = await epomlparse(noteTemplate);
    console.log(`Template: ${noteTemplate.trim()}`);
    console.log(`Result:\n${noteResult}\n`);
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 2: Using the Todo component
  console.log('Example 2: Todo Component');
  const todoTemplate = `
    <list>
      <Todo item="Learn EPOML" completed={true} />
      <Todo item="Build custom components" completed={false} />
      <Todo item="Deploy application" completed={false} />
    </list>
  `;
  
  try {
    const todoResult = await epomlparse(todoTemplate);
    console.log(`Template: ${todoTemplate.trim()}`);
    console.log(`Result:\n${todoResult}\n`);
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 3: Combining multiple custom components
  console.log('Example 3: Combining Custom Components');
  const combinedTemplate = `
    <div>
      <Note title="Tasks for today">
        Here are the tasks you need to complete today:
      </Note>
      <list>
        <Todo item="Review code" completed={true} />
        <Todo item="Write documentation" completed={false} />
        <Todo item="Test components" completed={false} />
      </list>
    </div>
  `;
  
  try {
    const combinedResult = await epomlparse(combinedTemplate);
    console.log(`Template: ${combinedTemplate.trim()}`);
    console.log(`Result:\n${combinedResult}\n`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the demo
demonstrateCustomComponents().catch(console.error);