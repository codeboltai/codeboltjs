import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, processTemplateVars } from '../utils';
import { render } from '../core/renderer';

export interface ExampleSetProps extends BaseComponentProps {
  /** Title for the example set */
  title?: string;
  /** Description of the example set */
  description?: string;
  /** Whether to render examples inline */
  inline?: boolean;
  /** Number of examples to show (for truncation) */
  limit?: number;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export async function ExampleSet(props: ExampleSetProps): Promise<Component> {
  const {
    title,
    description,
    inline = false,
    limit,
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables
  const processedTitle = title ? processTemplateVars(title, templateVars) : title;
  const processedDescription = description ? processTemplateVars(description, templateVars) : description;

  // Apply limit if specified
  const limitedChildren = limit ? children.slice(0, limit) : children;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return await generateMarkdownExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
    
    case 'html':
      return await generateHtmlExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
    
    case 'json':
      return await generateJsonExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
    
    case 'yaml':
      return await generateYamlExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
    
    case 'xml':
      return await generateXmlExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
    
    case 'text':
    default:
      return await generateTextExampleSet(processedTitle, processedDescription, inline, limitedChildren, className, speaker);
  }
}

async function generateMarkdownExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let result = '';
  
  if (title) {
    result += `## ${title}\n\n`;
  }
  
  if (description) {
    result += `${description}\n\n`;
  }
  
  if (children.length > 0) {
    if (inline) {
      const renderedChildren = await Promise.all(children.map(render));
      result += `**Examples:** ${renderedChildren.join(', ')}`;
    } else {
      result += '**Examples:**\n\n';
      const renderedChildren = await Promise.all(children.map(render));
      renderedChildren.forEach((content, index) => {
        result += `${index + 1}. ${content}\n`;
      });
    }
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

async function generateHtmlExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let html = '<div class="example-set"';
  
  if (className) {
    html += ` class="${className}"`;
  }
  
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  
  html += '>\n';
  
  if (title) {
    html += `  <h3>${escapeHtml(title)}</h3>\n`;
  }
  
  if (description) {
    html += `  <p>${escapeHtml(description)}</p>\n`;
  }
  
  if (children.length > 0) {
    const renderedChildren = await Promise.all(children.map(render));
    if (inline) {
      html += '  <p><strong>Examples:</strong> ';
      html += renderedChildren.map(content => escapeHtml(content)).join(', ');
      html += '</p>\n';
    } else {
      html += '  <div class="examples">\n';
      html += '    <strong>Examples:</strong>\n';
      html += '    <ol>\n';
      renderedChildren.forEach(content => {
        html += `      <li>${escapeHtml(content)}</li>\n`;
      });
      html += '    </ol>\n';
      html += '  </div>\n';
    }
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

async function generateJsonExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const exampleSet: any = {};
  
  if (title) {
    exampleSet.title = title;
  }
  
  if (description) {
    exampleSet.description = description;
  }
  
  exampleSet.inline = inline;
  
  if (children.length > 0) {
    const renderedChildren = await Promise.all(children.map(render));
    exampleSet.examples = renderedChildren;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(exampleSet, null, 2));
}

async function generateYamlExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let yaml = '';
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}\n`;
  }
  
  yaml += `inline: ${inline}\n`;
  
  if (children.length > 0) {
    yaml += 'examples:\n';
    const renderedChildren = await Promise.all(children.map(render));
    renderedChildren.forEach(content => {
      yaml += `  - ${JSON.stringify(content)}\n`;
    });
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

async function generateXmlExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let xml = '<exampleSet';
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  if (title) {
    xml += ` title="${escapeXml(title)}"`;
  }
  
  xml += ` inline="${inline}"`;
  xml += '>\n';
  
  if (description) {
    xml += `  <description>${escapeXml(description)}</description>\n`;
  }
  
  if (children.length > 0) {
    xml += '  <examples>\n';
    const renderedChildren = await Promise.all(children.map(render));
    renderedChildren.forEach(content => {
      xml += `    <example>${escapeXml(content)}</example>\n`;
    });
    xml += '  </examples>\n';
  }
  
  xml += '</exampleSet>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

async function generateTextExampleSet(
  title: string | undefined,
  description: string | undefined,
  inline: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let result = '';
  
  if (title) {
    result += `EXAMPLE SET: ${title}\n`;
    result += '='.repeat(Math.max(12, title.length + 12)) + '\n\n';
  } else {
    result += 'EXAMPLE SET\n';
    result += '===========\n\n';
  }
  
  if (description) {
    result += `${description}\n\n`;
  }
  
  if (children.length > 0) {
    const renderedChildren = await Promise.all(children.map(render));
    if (inline) {
      result += 'Examples: ' + renderedChildren.join(', ');
    } else {
      result += 'Examples:\n';
      result += '--------\n\n';
      renderedChildren.forEach((content, index) => {
        result += `${index + 1}. ${content}\n`;
      });
    }
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}