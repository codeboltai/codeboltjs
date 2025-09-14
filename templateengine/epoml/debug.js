const { Paragraph } = require('./dist/components/Paragraph');
const { createElement } = require('./dist/core/createElement');
const { render } = require('./dist/core/renderer');

async function debug() {
  // Test zero limit
  const paragraph1 = createElement(Paragraph, { 
    charLimit: 0 
  }, 'This is a test paragraph.');
  
  const result1 = await render(paragraph1);
  console.log('Zero char limit result:', JSON.stringify(result1));
  
  const paragraph2 = createElement(Paragraph, { 
    tokenLimit: 0
  }, 'This is a test paragraph.');
  
  const result2 = await render(paragraph2);
  console.log('Zero token limit result:', JSON.stringify(result2));
}

debug();