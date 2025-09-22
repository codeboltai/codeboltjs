import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface WebpageProps extends BaseComponentProps {
  /** URL of the webpage */
  url: string;
  /** Title of the webpage */
  title?: string;
  /** Selector to extract specific content */
  selector?: string;
  /** Whether to extract text only */
  extractText?: boolean;
}

export function Webpage(props: WebpageProps): Component {
  const {
    url,
    title,
    selector,
    extractText = false,
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
      return generateMarkdownWebpage(url, title, selector, extractText, content, className, speaker);
    
    case 'html':
      return generateHtmlWebpage(url, title, selector, extractText, content, className, speaker);
    
    case 'json':
      return generateJsonWebpage(url, title, selector, extractText, content, className, speaker);
    
    case 'yaml':
      return generateYamlWebpage(url, title, selector, extractText, content, className, speaker);
    
    case 'xml':
      return generateXmlWebpage(url, title, selector, extractText, content, className, speaker);
    
    case 'text':
    default:
      return generateTextWebpage(url, title, selector, extractText, content, className, speaker);
  }
}

function generateMarkdownWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const displayTitle = title || url;
  let result = `🌐 [${displayTitle}](${url})`;
  
  if (selector) {
    result += ` (Selector: \`${selector}\`)`;
  }
  
  if (extractText) {
    result += ` (Text Only)`;
  }
  
  if (content) {
    result += `\n\n${content}`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const displayTitle = title || url;
  let html = `<div class="webpage">`;
  html += `<h3>🌐 <a href="${url.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${displayTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a></h3>`;
  
  if (selector || extractText) {
    html += `<p>`;
    if (selector) {
      html += `<em>Selector: ${selector.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</em> `;
    }
    if (extractText) {
      html += `<em>(Text Only)</em>`;
    }
    html += `</p>`;
  }
  
  if (content) {
    html += `<div class="webpage-content">${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  }
  
  html += `</div>`;
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'webpage', url };
  if (title) obj.title = title;
  if (selector) obj.selector = selector;
  if (extractText) obj.extractText = extractText;
  if (content) obj.content = content;
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: webpage\nurl: ${JSON.stringify(url)}\n`;
  if (title) yaml += `title: ${JSON.stringify(title)}\n`;
  if (selector) yaml += `selector: ${JSON.stringify(selector)}\n`;
  if (extractText) yaml += `extractText: ${extractText}\n`;
  if (content) yaml += `content: ${JSON.stringify(content)}`;
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = `<webpage url="${url.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  if (title) xml += ` title="${title.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  if (selector) xml += ` selector="${selector.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  if (extractText) xml += ` extractText="${extractText}"`;
  xml += `>`;
  if (content) xml += content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  xml += `</webpage>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextWebpage(
  url: string,
  title: string | undefined,
  selector: string | undefined,
  extractText: boolean,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const displayTitle = title || url;
  let result = `🌐 ${displayTitle} (${url})`;
  
  if (selector) {
    result += `\n   Selector: ${selector}`;
  }
  
  if (extractText) {
    result += `\n   Text Only: true`;
  }
  
  if (content) {
    result += `\n\n${content}`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}