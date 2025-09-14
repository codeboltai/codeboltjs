import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface StepwiseInstructionsProps extends BaseComponentProps {
  /** Instructions title */
  title?: string;
  /** Instructions description */
  description?: string;
  /** Steps array */
  steps?: string[];
  /** Whether to number the steps */
  numbered?: boolean;
}

export function StepwiseInstructions(props: StepwiseInstructionsProps): Component {
  const {
    title,
    description,
    steps = [],
    numbered = true,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // If children are provided, use them instead of steps
  if (children.length > 0) {
    return createElement('div', { className, 'data-speaker': speaker }, ...children);
  }

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownInstructions(title, description, steps, numbered, className, speaker);
    
    case 'html':
      return generateHtmlInstructions(title, description, steps, numbered, className, speaker);
    
    case 'json':
      return generateJsonInstructions(title, description, steps, numbered, className, speaker);
    
    case 'yaml':
      return generateYamlInstructions(title, description, steps, numbered, className, speaker);
    
    case 'xml':
      return generateXmlInstructions(title, description, steps, numbered, className, speaker);
    
    case 'text':
    default:
      return generateTextInstructions(title, description, steps, numbered, className, speaker);
  }
}

function generateMarkdownInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `# ${title}\n\n`;
  }
  
  if (description) {
    result += `${description}\n\n`;
  }
  
  if (steps.length > 0) {
    result += '## Steps\n\n';
    
    steps.forEach((step, index) => {
      const stepNumber = numbered ? `${index + 1}. ` : '- ';
      result += `${stepNumber}${step}\n`;
    });
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="instructions${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  
  if (title) {
    html += `  <h1>${escapeHtml(title)}</h1>\n`;
  }
  
  if (description) {
    html += `  <p>${escapeHtml(description)}</p>\n`;
  }
  
  if (steps.length > 0) {
    html += '  <h2>Steps</h2>\n';
    
    const listTag = numbered ? 'ol' : 'ul';
    html += `  <${listTag}>\n`;
    
    steps.forEach(step => {
      html += `    <li>${escapeHtml(step)}</li>\n`;
    });
    
    html += `  </${listTag}>\n`;
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  const instructions: any = {
    numbered
  };
  
  if (title) {
    instructions.title = title;
  }
  
  if (description) {
    instructions.description = description;
  }
  
  if (steps.length > 0) {
    instructions.steps = steps;
  }
  
  if (className) {
    instructions.className = className;
  }
  
  if (speaker) {
    instructions.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(instructions, null, 2));
}

function generateYamlInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  let yaml = `numbered: ${numbered}\n`;
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}\n`;
  }
  
  if (steps.length > 0) {
    yaml += `steps:\n${steps.map(step => `  - ${JSON.stringify(step)}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  let xml = `<instructions numbered="${numbered}"`;
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  if (title) {
    xml += `  <title>${escapeXml(title)}</title>\n`;
  }
  
  if (description) {
    xml += `  <description>${escapeXml(description)}</description>\n`;
  }
  
  if (steps.length > 0) {
    xml += '  <steps>\n';
    steps.forEach(step => {
      xml += `    <step>${escapeXml(step)}</step>\n`;
    });
    xml += '  </steps>\n';
  }
  
  xml += '</instructions>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextInstructions(
  title: string | undefined,
  description: string | undefined,
  steps: string[],
  numbered: boolean,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `INSTRUCTIONS: ${title}\n`;
    result += '='.repeat(Math.max(12, title.length + 11)) + '\n\n';
  }
  
  if (description) {
    result += `${description}\n\n`;
  }
  
  if (steps.length > 0) {
    result += 'STEPS:\n';
    result += '-----\n\n';
    
    steps.forEach((step, index) => {
      const stepNumber = numbered ? `${index + 1}. ` : '- ';
      result += `${stepNumber}${step}\n`;
    });
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}