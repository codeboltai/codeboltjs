import { render } from '../core/renderer';
import { createElement } from '../core/createElement';
import { Italic, Text, Paragraph, Strikethrough, Underline, Newline, List, ListItem, SubContent, Folder, Webpage, Conversation, AiMessage, HumanMessage, SystemMessage, MessageContext, ToolRequest, ToolResponse } from './index';

async function testComponents() {
  console.log('Testing new components...\n');

  // Test Italic component
  const italicComponent = createElement(Italic, {}, 'This is italic text');
  console.log('Italic:', await render(italicComponent));

  // Test Text component
  const textComponent = createElement(Text, { content: 'This is plain text' });
  console.log('Text:', await render(textComponent));

  // Test Paragraph component
  const paragraphComponent = createElement(Paragraph, {}, 'This is a paragraph');
  console.log('Paragraph:', await render(paragraphComponent));

  // Test Strikethrough component
  const strikethroughComponent = createElement(Strikethrough, {}, 'This is strikethrough text');
  console.log('Strikethrough:', await render(strikethroughComponent));

  // Test Underline component
  const underlineComponent = createElement(Underline, {}, 'This is underlined text');
  console.log('Underline:', await render(underlineComponent));

  // Test Newline component
  const newlineComponent = createElement(Newline, {});
  console.log('Newline:', await render(newlineComponent));

  // Test List and ListItem components
  const listComponent = createElement(List, {}, 
    createElement(ListItem, {}, 'First item'),
    createElement(ListItem, {}, 'Second item')
  );
  console.log('List:', await render(listComponent));

  // Test SubContent component
  const subContentComponent = createElement(SubContent, { title: 'Section Title' }, 'This is subcontent');
  console.log('SubContent:', await render(subContentComponent));

  // Test Folder component
  const folderComponent = createElement(Folder, { name: 'My Folder' }, 'Folder contents');
  console.log('Folder:', await render(folderComponent));

  // Test Webpage component
  const webpageComponent = createElement(Webpage, { url: 'https://example.com', title: 'Example' }, 'Webpage content');
  console.log('Webpage:', await render(webpageComponent));

  // Test Conversation component
  const conversationComponent = createElement(Conversation, { title: 'Chat' },
    createElement(HumanMessage, { name: 'User' }, 'Hello'),
    createElement(AiMessage, { model: 'GPT-4' }, 'Hi there!')
  );
  console.log('Conversation:', await render(conversationComponent));

  // Test SystemMessage component
  const systemMessageComponent = createElement(SystemMessage, { priority: 'high' }, 'System alert');
  console.log('SystemMessage:', await render(systemMessageComponent));

  // Test MessageContext component
  const messageContextComponent = createElement(MessageContext, { description: 'Context info' }, 'Context details');
  console.log('MessageContext:', await render(messageContextComponent));

  // Test ToolRequest component
  const toolRequestComponent = createElement(ToolRequest, { tool: 'calculator', parameters: { operation: 'add', a: 1, b: 2 } }, 'Request details');
  console.log('ToolRequest:', await render(toolRequestComponent));

  // Test ToolResponse component
  const toolResponseComponent = createElement(ToolResponse, { tool: 'calculator', status: 'success', data: { result: 3 } }, 'Response details');
  console.log('ToolResponse:', await render(toolResponseComponent));

  console.log('\nAll components tested successfully!');
}

// Run the test
testComponents().catch(console.error);