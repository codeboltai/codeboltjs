import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface TextProps extends BaseComponentProps {
  /** Text content */
  content?: string;
}

export function Text(props: TextProps): Component {
  const {
    content,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Use content prop or children
  const textContent = content || children.map(child => typeof child === 'string' ? child : '').join('');

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownText(textContent, className, speaker);
    
    case 'html':
      return generateHtmlText(textContent, className, speaker);
    
    case 'json':
      return generateJsonText(textContent, className, speaker);
    
    case 'yaml':
      return generateYamlText(textContent, className, speaker);
    
    case 'xml':
      return generateXmlText(textContent, className, speaker);
    
    case 'text':
    default:
      return generatePlainText(textContent, className, speaker);
  }
}

function generateMarkdownText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateHtmlText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}

function generateJsonText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'text', content };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: text\ncontent: ${JSON.stringify(content)}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<text>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generatePlainText(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}