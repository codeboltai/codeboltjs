import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface UnderlineProps extends BaseComponentProps {
  // No additional props needed for basic underline formatting
}

export function Underline(props: UnderlineProps): Component {
  const {
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
      return generateMarkdownUnderline(content, className, speaker);
    
    case 'html':
      return generateHtmlUnderline(content, className, speaker);
    
    case 'json':
      return generateJsonUnderline(content, className, speaker);
    
    case 'yaml':
      return generateYamlUnderline(content, className, speaker);
    
    case 'xml':
      return generateXmlUnderline(content, className, speaker);
    
    case 'text':
    default:
      return generateTextUnderline(content, className, speaker);
  }
}

function generateMarkdownUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  // Markdown doesn't have native underline, use HTML
  return createElement('span', { className, 'data-speaker': speaker }, `<u>${content}</u>`);
}

function generateHtmlUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('u', { className, 'data-speaker': speaker }, content);
}

function generateJsonUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'underline', text: content };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: underline\ntext: ${JSON.stringify(content)}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<underline>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</underline>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generateTextUnderline(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}