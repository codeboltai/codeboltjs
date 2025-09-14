import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, repeatChar, processTemplateVars } from '../utils';

export interface OutputFormatProps extends BaseComponentProps {
  /** Output format type */
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html';
  /** Description of the format */
  description?: string;
  /** Example of the format */
  example?: string;
  /** Schema definition for the format */
  schema?: any;
  /** Whether this is the preferred format */
  preferred?: boolean;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export function OutputFormat(props: OutputFormatProps): Component {
  const {
    type,
    description,
    example,
    schema,
    preferred = false,
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables in text content
  const processedDescription = description ? processTemplateVars(description, templateVars) : description;
  const processedExample = example ? processTemplateVars(example, templateVars) : example;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
    
    case 'html':
      return generateHtmlOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
    
    case 'json':
      return generateJsonOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
    
    case 'yaml':
      return generateYamlOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
    
    case 'xml':
      return generateXmlOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
    
    case 'text':
    default:
      return generateTextOutputFormat(type, processedDescription, processedExample, schema, preferred, children, className, speaker);
  }
}

function generateMarkdownOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  const preferredMarker = preferred ? ' 🌟 (Preferred)' : '';
  result += `## Output Format: ${type}${preferredMarker}\n\n`;
  
  if (description) {
    result += `**Description:** ${description}\n\n`;
  }
  
  if (example) {
    result += '### Example\n\n';
    result += '```' + type + '\n' + example + '\n```\n\n';
  }
  
  if (schema) {
    result += '### Schema\n\n';
    result += '```json\n' + JSON.stringify(schema, null, 2) + '\n```\n\n';
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const preferredMarker = preferred ? ' 🌟 (Preferred)' : '';
  
  let html = `<div class="output-format${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  html += `  <h2>Output Format: ${escapeHtml(type)}${preferredMarker}</h2>\n`;
  
  if (description) {
    html += `  <p class="format-description"><strong>Description:</strong> ${escapeHtml(description)}</p>\n`;
  }
  
  if (example) {
    html += '  <h3>Example</h3>\n';
    html += `  <pre class="format-example"><code class="language-${type}">${escapeHtml(example)}</code></pre>\n`;
  }
  
  if (schema) {
    html += '  <h3>Schema</h3>\n';
    html += `  <pre class="format-schema"><code class="language-json">${escapeHtml(JSON.stringify(schema, null, 2))}</code></pre>\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class="format-details">\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const format: any = {
    type,
    preferred
  };
  
  if (description) {
    format.description = description;
  }
  
  if (example) {
    format.example = example;
  }
  
  if (schema) {
    format.schema = schema;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    format.details = childrenContent;
  }
  
  if (className) {
    format.className = className;
  }
  
  if (speaker) {
    format.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(format, null, 2));
}

function generateYamlOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const preferredMarker = preferred ? ' 🌟 (Preferred)' : '';
  let yaml = `type: ${type}\npreferred: ${preferred}\n`;
  
  if (description) {
    yaml += `description: ${JSON.stringify(description)}\n`;
  }
  
  if (example) {
    yaml += `example: |\n${example.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (schema) {
    yaml += `\nschema: ${JSON.stringify(schema)}`;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `\ndetails: |\n${childrenContent.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<outputFormat type="${type}" preferred="${preferred}"`;
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  if (description) {
    xml += `  <description>${escapeXml(description)}</description>\n`;
  }
  
  if (example) {
    xml += `  <example><![CDATA[${example}]]></example>\n`;
  }
  
  if (schema) {
    xml += `  <schema>${escapeXml(JSON.stringify(schema))}</schema>\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\n`;
  }
  
  xml += '</outputFormat>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextOutputFormat(
  type: 'json' | 'xml' | 'csv' | 'yaml' | 'text' | 'markdown' | 'html',
  description: string | undefined,
  example: string | undefined,
  schema: any,
  preferred: boolean,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const preferredMarker = preferred ? ' 🌟 (Preferred)' : '';
  
  let result = `OUTPUT FORMAT: ${type.toUpperCase()}${preferredMarker}\n`;
  result += repeatChar('=', Math.max(14, type.length + 14)) + '\n\n';
  
  if (description) {
    result += `Description: ${description}\n\n`;
  }
  
  if (example) {
    result += 'Example:\n';
    result += '-------\n';
    result += `${example}\n\n`;
  }
  
  if (schema) {
    result += 'Schema:\n';
    result += '------\n';
    result += `${JSON.stringify(schema, null, 2)}\n\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    result += 'Details:\n';
    result += '-------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

