# Create Local MCP

Click on Create Custom MCP. A popup will appear asking for the title, unique name, and description. Fill in the details, then click Create MCP.

```js
import { ToolBox } from '@codebolt/codeboltjs/utils';
import { z } from 'zod';

const toolbox = new ToolBox({
  name: "hello",
  version: "1.0.0"  
});

toolbox.addTool({
  name: "hello",
  description: "Says hello",
  parameters: z.object({
    name: z.string().describe("Name to greet")
  }),
  execute: async (args, context) => {
    return `Hello, ${args.name}!`;
  }
});

async function main() {
  try {
    await toolbox.activate();
    console.log('Toolbox is running!');
  } catch (error) {
    console.error('Failed to start toolbox:', error);
  }
}

main();
```

<video controls width="100%" src="/video/basics/localmcp.mp4">
 Browser not accept 
</video>
