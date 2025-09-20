import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface SubContentProps extends BaseComponentProps {
  /** Title for the subcontent section */
  title?: string;
}

export function SubContent(props: SubContentProps): Component {
  const {
    title,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process children content
  const content = children.map(child => typeof child === 'string' ? child : '').join('');

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownSubContent(title, content, className, speaker);
    
    case 'html':
      return generateHtmlSubContent(title, content, className, speaker);
    
    case 'json':
      return generateJsonSubContent(title, content, className, speaker);
    
    case 'yaml':
      return generateYamlSubContent(title, content, className, speaker);
    
    case 'xml':
      return generateXmlSubContent(title, content, className, speaker);
    
    case 'text':
    default:
      return generateTextSubContent(title, content, className, speaker);
  }
}

function generateMarkdownSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  if (title) {
    result += `### ${title}\n\n`;
  }
  result += `${content}\n`;
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '';
  if (title) {
    html += `<h3>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>\n`;
  }
  html += `<div>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'subcontent', content };
  if (title) {
    obj.title = title;
  }
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = 'type: subcontent\n';
  if (title) {
    yaml += `title: ${JSON.stringify(title)}\n`;
  }
  yaml += `content: ${JSON.stringify(content)}`;
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<subcontent';
  if (title) {
    xml += ` title="${title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  xml += `>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</subcontent>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextSubContent(
  title: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  if (title) {
    result += `${title}\n${'='.repeat(title.length)}\n\n`;
  }
  result += `${content}\n`;
  return createElement('div', { className, 'data-speaker': speaker }, result);
}