import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ItalicProps extends BaseComponentProps {
  // No additional props needed for basic italic formatting
}

export function Italic(props: ItalicProps): Component {
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
      return generateMarkdownItalic(content, className, speaker);
    
    case 'html':
      return generateHtmlItalic(content, className, speaker);
    
    case 'json':
      return generateJsonItalic(content, className, speaker);
    
    case 'yaml':
      return generateYamlItalic(content, className, speaker);
    
    case 'xml':
      return generateXmlItalic(content, className, speaker);
    
    case 'text':
    default:
      return generateTextItalic(content, className, speaker);
  }
}

function generateMarkdownItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, `*${content}*`);
}

function generateHtmlItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('em', { className, 'data-speaker': speaker }, content);
}

function generateJsonItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'italic', text: content };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: italic\ntext: ${JSON.stringify(content)}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<italic>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</italic>`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generateTextItalic(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, content);
}