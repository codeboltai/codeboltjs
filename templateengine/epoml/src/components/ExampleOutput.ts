import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeHtml, escapeXml, processTemplateVars } from '../utils';
import { render } from '../core/renderer';

export interface ExampleOutputProps extends BaseComponentProps {
  /** Label for the example output */
  label?: string;
  /** Whether to render as inline */
  inline?: boolean;
  /** Output format/type */
  format?: string;
  /** Template variables for dynamic content */
  templateVars?: Record<string, any>;
}

export async function ExampleOutput(props: ExampleOutputProps): Promise<Component> {
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
      return await generateMarkdownExampleOutput(processedLabel, inline, format, children, className, speaker);
    
    case 'html':
      return await generateHtmlExampleOutput(processedLabel, inline, format, children, className, speaker);
    
    case 'json':
      return await generateJsonExampleOutput(processedLabel, inline, format, children, className, speaker);
    
    case 'yaml':
      return await generateYamlExampleOutput(processedLabel, inline, format, children, className, speaker);
    
    case 'xml':
      return await generateXmlExampleOutput(processedLabel, inline, format, children, className, speaker);
    
    case 'text':
    default:
      return await generateTextExampleOutput(processedLabel, inline, format, children, className, speaker);
  }
}

async function generateMarkdownExampleOutput(
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
      result += '**Output:**\n';
    }
    
    if (format) {
      result += '```' + format + '\n' + content + '\n```';
    } else {
      result +=  content + '\n';
    }
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

async function generateHtmlExampleOutput(
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
    html += '<span class="example-output"';
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
    html += '<div class="example-output"';
    if (className) {
      html += ` class="${className}"`;
    }
    html += '>\n';
    
    if (label) {
      html += `  <h4>${escapeHtml(label)}</h4>\n`;
    } else {
      html += '  <h4>Output</h4>\n';
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

async function generateJsonExampleOutput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  const exampleOutput: any = {};
  
  if (label) {
    exampleOutput.label = label;
  }
  
  exampleOutput.inline = inline;
  
  if (format) {
    exampleOutput.format = format;
  }
  
  const content = (await Promise.all(children.map(render))).join('');
  if (content) {
    exampleOutput.content = content;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(exampleOutput, null, 2));
}

async function generateYamlExampleOutput(
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

async function generateXmlExampleOutput(
  label: string | undefined,
  inline: boolean,
  format: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Promise<Component> {
  let xml = '<exampleOutput';
  
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
  
  xml += '</exampleOutput>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

async function generateTextExampleOutput(
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
      result += `OUTPUT: ${label}\n`;
      result += '='.repeat(Math.max(7, label.length + 7)) + '\n\n';
    } else {
      result += 'OUTPUT\n';
      result += '======\n\n';
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