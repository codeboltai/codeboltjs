import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, processTemplateVars } from '../utils';
import { render } from '../core/renderer';

export interface ExampleInputProps extends BaseComponentProps {
  /** Label for the example input */
  label?: string;
  /** Whether to render as inline */
  inline?: boolean;
  /** Input format/type */
  format?: string;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export async function ExampleInput(props: ExampleInputProps): Promise<Component> {
  const {
    label,
    inline = false,
    format,
    templateVars = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process template variables
  const processedLabel = label ? processTemplateVars(label, templateVars) : label;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return await generateMarkdownExampleInput(processedLabel, inline, format, children, className, speaker);
    
    case 'html':
      return await generateHtmlExampleInput(processedLabel, inline, format, children, className, speaker);
    
    case 'json':
      return await generateJsonExampleInput(processedLabel, inline, format, children, className, speaker);
    
    case 'yaml':
      return await generateYamlExampleInput(processedLabel, inline, format, children, className, speaker);
    
    case 'xml':
      return await generateXmlExampleInput(processedLabel, inline, format, children, className, speaker);
    
    case 'text':
    default:
      return await generateTextExampleInput(processedLabel, inline, format, children, className, speaker);
  }
}

async function generateMarkdownExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let result = '';
  
  const content = (await Promise.all(children.map(render))).join('');
  
  if (inline) {
    if (label) {
      result += `**${label}:** `;
    }
    result += '`' + content + '`';
  } else {
    if (label) {
      result += `**${label}**\n`;
    } else {
      result += '**Input:**\n';
    }
    
    if (format) {
      result += '```' + format + '\n' + content + '\n```\n\n';
    } else {
      result += content + '\n\n';
    }
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

async function generateHtmlExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let html = '';
  
  const content = (await Promise.all(children.map(render))).join('');
  
  if (inline) {
    html += '<span class="example-input"';
    if (className) {
      html += ` class="${className}"`;
    }
    html += '>';
    
    if (label) {
      html += `<strong>${escapeHtml(label)}:</strong> `;
    }
    html += `<code>${escapeHtml(content)}</code>`;
    html += '</span>';
  } else {
    html += '<div class="example-input"';
    if (className) {
      html += ` class="${className}"`;
    }
    html += '>\n';
    
    if (label) {
      html += `  <h4>${escapeHtml(label)}</h4>\n`;
    } else {
      html += '  <h4>Input</h4>\n';
    }
    
    html += `  <pre><code`;
    if (format) {
      html += ` class="language-${format}"`;
    }
    html += `>${escapeHtml(content)}</code></pre>\n`;
    html += '</div>';
  }
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

async function generateJsonExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const exampleInput: any = {};
  
  if (label) {
    exampleInput.label = label;
  }
  
  exampleInput.inline = inline;
  
  if (format) {
    exampleInput.format = format;
  }
  
  const content = (await Promise.all(children.map(render))).join('');
  if (content) {
    exampleInput.content = content;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(exampleInput, null, 2));
}

async function generateYamlExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let yaml = '';
  
  if (label) {
    yaml += `label: ${JSON.stringify(label)}\n`;
  }
  
  yaml += `inline: ${inline}\n`;
  
  if (format) {
    yaml += `format: ${JSON.stringify(format)}\n`;
  }
  
  const content = (await Promise.all(children.map(render))).join('');
  if (content) {
    yaml += `content: |\n${content.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

async function generateXmlExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let xml = '<exampleInput';
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  if (label) {
    xml += ` label="${escapeXml(label)}"`;
  }
  
  if (format) {
    xml += ` format="${format}"`;
  }
  
  xml += ` inline="${inline}"`;
  xml += '>';
  
  const content = (await Promise.all(children.map(render))).join('');
  if (content) {
    xml += `\n  <content>${escapeXml(content)}</content>\n`;
  }
  
  xml += '</exampleInput>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

async function generateTextExampleInput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let result = '';
  
  const content = (await Promise.all(children.map(render))).join('');
  
  if (inline) {
    if (label) {
      result += `${label}: `;
    }
    result += content;
  } else {
    if (label) {
      result += `INPUT: ${label}\n`;
      result += '='.repeat(Math.max(6, label.length + 6)) + '\n\n';
    } else {
      result += 'INPUT\n';
      result += '=====\n\n';
    }
    
    if (format) {
      result += `Format: ${format}\n\n`;
    }
    
    result += 'Content:\n';
    result += '-------\n';
    result += content;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}