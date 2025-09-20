
# EPOML (Enhanced Prompt Orchestration Markup Language)


EPOML is a JSX-based template engine for orchestrating prompts and rendering to plain text. It uses SWC (Speedy Web Compiler) for fast JSX transformation, making it efficient for runtime template processing and AI prompt generation.

## Installation

```bash
npm install epoml
```

## Usage

### Using the epomlparse function (Recommended)

The easiest way to use EPOML is with the `epomlparse` function:

```javascript
import { epomlparse } from 'epoml';

const prompt = `
<>
  <p>This is basic text</p>
  <list>
    <item>item1</item>
    <item>item2</item>
  </list>
</>
`;

const output = await epomlparse(prompt);
console.log(output);
// Output:
// This is basic text
// - item1
// - item2
```

### Template Variables

EPOML supports template variables that can be passed as a second parameter to `epomlparse`:

```javascript
import { epomlparse } from 'epoml';

const template = `
<>
  <p>My name is {name}</p>
  <FileTree directory={treepath} depth={2} />
</>
`;

const variables = {
  name: "Alice",
  treepath: "./src"
};

const output = await epomlparse(template, variables);
console.log(output);
// Output:
// My name is Alice
// [file tree of ./src directory]
```

### Components

EPOML comes with built-in components:

- `<p>` - Paragraph element
- `<list>` - List container
- `<item>` - List item
- `<FileTree>` - File tree component that shows the directory structure

Example with FileTree:

```javascript
import { epomlparse } from 'epoml';

const prompt = `
<>
  <p>Project structure:</p>
  <FileTree depth={2} directory={projectPath}/>
</>
`;

const output = await epomlparse(prompt, { projectPath: './src' });
console.log(output);
```

## API

### epomlparse(prompt: string, variables?: Record<string, any>): Promise<string>

Parses an EPOML string and returns the rendered output.

**Parameters:**
- `prompt` - The EPOML template string to parse
- `variables` - Optional object containing variables to substitute in the template

**Example:**
```javascript
// Basic usage
const result = await epomlparse('<p>Hello World</p>');

// With variables
const result = await epomlparse('<p>Hello {name}</p>', { name: 'Alice' });
```

### render(component: Component | string): Promise<string>

Renders an EPOML component tree to a string. This is the underlying function used by `epomlparse`.

**Parameters:**
- `component` - The component tree to render

**Example:**
```javascript
import { render, createElement } from 'epoml';

const component = createElement('p', {}, 'Hello World');
const result = await render(component);
```

## Performance

EPOML uses SWC (Speedy Web Compiler) for JSX transformation, which provides significant performance improvements over traditional transpilers like Babel or TypeScript's built-in transpiler. SWC is used by major frameworks like Next.js and is one of the fastest JavaScript/TypeScript compilers available.

## Recent Improvements ✨

- **Enhanced Code Component**: Improved support for complex JavaScript code blocks using template variables to avoid JSX parsing conflicts
- **Component Naming**: Renamed `Object` component to `DataObject` to prevent conflicts with JavaScript's built-in Object
- **Template Variable Best Practices**: Added comprehensive documentation for using template variables with code blocks
- **JSX Parsing Safety**: Implemented safer patterns for including complex code in templates
- **Documentation Updates**: Enhanced component documentation with troubleshooting guides and best practices

## Custom Components

You can create custom components by defining functions that return EPOML elements:

```javascript
import { createElement } from 'epoml';

function MyComponent({ name }) {
  return createElement('p', {}, `Hello, ${name}!`);
}
```

Then use it in your EPOML:

```javascript
const prompt = `
<MyComponent name="World" />
`;

const output = await epomlparse(prompt);
```

### Advanced Custom Component Example

Here's a more advanced example showing how to create custom components with the Epoml namespace:

```javascript
import { epomlparse, createElement, registerComponent, type Component } from 'epoml';

// Define a custom component using createElement
function Note({ title, children }: { title: string; children: (Component | string)[] }): Component {
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

// Use the components in EPOML
const template = `
<div>
  <Note title="Tasks for today">
    Here are the tasks you need to complete today:
  </Note>
  <list>
    <Todo item="Review code" completed={true} />
    <Todo item="Write documentation" completed={false} />
  </list>
</div>
`;

const output = await epomlparse(template);
```

This example demonstrates:
1. Creating custom components using `createElement`
2. Defining component props and children
3. Registering components with `registerComponent`
4. Using the components in EPOML templates