import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import { escapeXml, repeatChar } from '../utils';

export interface DocumentProps extends BaseComponentProps {
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Document version */
  version?: string;
  /** Document date */
  date?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export function Document(props: DocumentProps): Component {
  const {
    title,
    author,
    version,
    date,
    metadata = {},
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownDocument(title, author, version, date, metadata, children, className, speaker);
    
    case 'html':
      return generateHtmlDocument(title, author, version, date, metadata, children, className, speaker);
    
    case 'json':
      return generateJsonDocument(title, author, version, date, metadata, children, className, speaker);
    
    case 'yaml':
      return generateYamlDocument(title, author, version, date, metadata, children, className, speaker);
    
    case 'xml':
      return generateXmlDocument(title, author, version, date, metadata, children, className, speaker);
    
    case 'text':
    default:
      return generateTextDocument(title, author, version, date, metadata, children, className, speaker);
  }
}

function generateMarkdownDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `# ${title}\n`;
  }
  
  if (author || version || date) {
    result += '<!-- Document Info -->\n';
    
    if (author) {
      result += `**Author:** ${author}  \n`;
    }
    
    if (version) {
      result += `**Version:** ${version}  \n`;
    }
    
    if (date) {
      result += `**Date:** ${date}  \n`;
    }
    
    result += '\n';
  }
  
  // Add metadata as comments
  if (Object.keys(metadata).length > 0) {
    result += '<!-- Metadata -->\n';
    for (const [key, value] of Object.entries(metadata)) {
      result += `<!-- ${key}: ${value} -->\n`;
    }
    result += '\n';
  }
  
  // Add children content
  const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
  result += childrenContent;
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let html = '<!DOCTYPE html>\n<html>\n<head>\n';
  
  if (title) {
    html += `  <title>${title}</title>\n`;
  }
  
  // Add metadata as meta tags
  for (const [key, value] of Object.entries(metadata)) {
    html += `  <meta name="${key}" content="${value}">\n`;
  }
  
  html += '</head>\n<body>\n';
  
  if (title) {
    html += `  <h1>${title}</h1>\n`;
  }
  
  if (author || version || date) {
    html += '  <div class="document-info">\n';
    
    if (author) {
      html += `    <p><strong>Author:</strong> ${author}</p>\n`;
    }
    
    if (version) {
      html += `    <p><strong>Version:</strong> ${version}</p>\n`;
    }
    
    if (date) {
      html += `    <p><strong>Date:</strong> ${date}</p>\n`;
    }
    
    html += '  </div>\n';
  }
  
  // Add children content
  const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
  html += `  <div class="document-content">\n${childrenContent}\n  </div>\n`;
  
  html += '</body>\n</html>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const doc: any = {};
  
  if (title) {
    doc.title = title;
  }
  
  if (author) {
    doc.author = author;
  }
  
  if (version) {
    doc.version = version;
  }
  
  if (date) {
    doc.date = date;
  }
  
  if (Object.keys(metadata).length > 0) {
    doc.metadata = metadata;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    doc.content = childrenContent;
  }
  
  if (className) {
    doc.className = className;
  }
  
  if (speaker) {
    doc.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(doc, null, 2));
}

function generateYamlDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let yaml = '';
  
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  
  if (author) {
    yaml += `author: ${JSON.stringify(author)}\n`;
  }
  
  if (version) {
    yaml += `version: ${JSON.stringify(version)}\n`;
  }
  
  if (date) {
    yaml += `date: ${JSON.stringify(date)}\n`;
  }
  
  if (Object.keys(metadata).length > 0) {
    yaml += 'metadata:\n';
    for (const [key, value] of Object.entries(metadata)) {
      yaml += `  ${key}: ${JSON.stringify(value)}\n`;
    }
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `content: |\n${childrenContent.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = '<document';
  
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
  
  if (author) {
    xml += `  <author>${escapeXml(author)}</author>\n`;
  }
  
  if (version) {
    xml += `  <version>${escapeXml(version)}</version>\n`;
  }
  
  if (date) {
    xml += `  <date>${escapeXml(date)}</date>\n`;
  }
  
  if (Object.keys(metadata).length > 0) {
    xml += '  <metadata>\n';
    for (const [key, value] of Object.entries(metadata)) {
      xml += `    <${key}>${escapeXml(String(value))}</${key}>\n`;
    }
    xml += '  </metadata>\n';
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <content>${escapeXml(childrenContent)}</content>\n`;
  }
  
  xml += '</document>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextDocument(
  title: string | undefined,
  author: string | undefined,
  version: string | undefined,
  date: string | undefined,
  metadata: Record<string, any>,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (title) {
    result += `DOCUMENT: ${title}\n`;
    result += repeatChar('=', Math.max(9, title.length + 9)) + '\n\n';
  } else {
    result += 'DOCUMENT\n';
    result += repeatChar('=', 8) + '\n\n';
  }
  
  if (author || version || date) {
    result += 'Document Information:\n';
    result += '-------------------\n\n';
    
    if (author) {
      result += `Author: ${author}\n`;
    }
    
    if (version) {
      result += `Version: ${version}\n`;
    }
    
    if (date) {
      result += `Date: ${date}\n`;
    }
    
    result += '\n';
  }
  
  // Add metadata
  if (Object.keys(metadata).length > 0) {
    result += 'Metadata:\n';
    result += '--------\n\n';
    for (const [key, value] of Object.entries(metadata)) {
      result += `${key}: ${value}\n`;
    }
    result += '\n';
  }
  
  // Add children content
  if (children.length > 0) {
    result += 'Content:\n';
    result += '-------\n\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

