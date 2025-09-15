import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';
import codebolt from '@codebolt/codeboltjs';

export interface FolderProps extends BaseComponentProps {
  /** Folder name */
  name?: string;
  /** Folder path */
  path?: string;
}

export async function Folder(props: FolderProps): Promise<Component> {
  const {
    name = 'Folder',
    path,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  const listResult = await codebolt.fs.listFile(path || '', false);
  
  // Parse the listFile response and format files
  let fileListContent = '';
  if (listResult && listResult.success && listResult.result) {
    const files = listResult.result.split('\n').filter((file: string) => file.trim());
    fileListContent = files.map((file: string) => `  - ${file}`).join('\n');
  }
  
  // Process children content
  const content = children.map(child => typeof child === 'string' ? child : '').join('');

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownFolder(name, path, fileListContent, className, speaker);
    
    case 'html':
      return generateHtmlFolder(name, path, fileListContent, className, speaker);
    
    case 'json':
      return generateJsonFolder(name, path, fileListContent, className, speaker);
    
    case 'yaml':
      return generateYamlFolder(name, path, fileListContent, className, speaker);
    
    case 'xml':
      return generateXmlFolder(name, path, fileListContent, className, speaker);
    
    case 'text':
    default:
      return generateTextFolder(name, path, fileListContent, className, speaker);
  }
}

function generateMarkdownFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = `📁 **${name}**`;
  if (path) {
    result += ` (\`${path}\`)`;
  }
  if (content) {
    result += `\n\n${content}\n`;
  }
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = `<div class="folder">`;
  html += `<h3>📁 ${name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>`;
  if (path) {
    html += `<p><em>Path: ${path.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</em></p>`;
  }
  html += `<div class="folder-content">${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
  html += `</div>`;
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'folder', name, content };
  if (path) {
    obj.path = path;
  }
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = `type: folder\nname: ${JSON.stringify(name)}\n`;
  if (path) {
    yaml += `path: ${JSON.stringify(path)}\n`;
  }
  yaml += `content: ${JSON.stringify(content)}`;
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = `<folder name="${name.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  if (path) {
    xml += ` path="${path.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  xml += `>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</folder>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextFolder(
  name: string,
  path: string | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let result = `📁 ${name}`;
  if (path) {
    result += ` (${path})`;
  }
  if (content) {
    result += `\n${'-'.repeat(Math.max(name.length + 2, 10))}\n${content}\n`;
  }
  return createElement('div', { className, 'data-speaker': speaker }, result);
}