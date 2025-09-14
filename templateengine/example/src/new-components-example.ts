import { epomlparse } from 'epoml';

async function example() {
  // Example EPOML with new components
  const epoml = `
    <div>
      <Paragraph>
        This is a <Italic>paragraph</Italic> with <Strikethrough>strikethrough</Strikethrough> and <Underline>underline</Underline> text.
      </Paragraph>
      
      <List>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
        <ListItem>Third item</ListItem>
      </List>
      
      <SubContent title="Section">
        This is content in a sub-section.
      </SubContent>
      
      <Folder name="Project Files">
        <List>
          <ListItem>README.md</ListItem>
          <ListItem>package.json</ListItem>
          <ListItem>src/</ListItem>
        </List>
      </Folder>
      
      <Conversation title="Chat Example">
        <HumanMessage name="User">
          Hello, how can I help you today?
        </HumanMessage>
        <AiMessage model="GPT-4">
          I'm here to assist with your questions!
        </AiMessage>
        <SystemMessage priority="high">
          Connection established
        </SystemMessage>
      </Conversation>
      
      <ToolRequest tool="calculator" parameters={{operation: "add", a: 5, b: 3}}>
        Adding two numbers
      </ToolRequest>
      
      <ToolResponse tool="calculator" status="success" data={{result: 8}}>
        Calculation complete
      </ToolResponse>
    </div>
  `;

  try {
    const result = await epomlparse(epoml);
    console.log('Rendered output:');
    console.log(result);
  } catch (error) {
    console.error('Error parsing EPOML:', error);
  }
}

example();