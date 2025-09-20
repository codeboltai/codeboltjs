import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface StrikethroughProps extends BaseComponentProps {
  // No additional props needed for basic strikethrough formatting
}

export function Strikethrough(props: StrikethroughProps): Component {
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
      return generateMarkdownStrikethrough(content, className, speaker);
    
    case 'html':
      return generateHtmlStrikethrough(content, className, speaker);
    
    case 'json':
      return generateJsonStrikethrough(content, className, speaker);
    
    case 'yaml':
      return generateYamlStrikethrough(content, className, speaker);
    
    case 'xml':
      return generateXmlStrikethrough(content, className, speaker);
    
    case 'text':
    default:
      return generateTextStrikethrough(content, className, speaker);
  }
}

function generateMarkdownStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, `~~${content}~~`);
}

function generateHtmlStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('del', { className, 'data-speaker': speaker }, content);
}

function generateJsonStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'strikethrough', text: content };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: strikethrough\ntext: ${JSON.stringify(content)}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<strikethrough>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strikethrough>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generateTextStrikethrough(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}