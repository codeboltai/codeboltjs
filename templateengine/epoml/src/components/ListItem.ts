import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ListItemProps extends BaseComponentProps {
}

export function ListItem(props: ListItemProps): Component {
  const {
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Process children content
  let content = children.map(child => typeof child === 'string' ? child : '').join('');

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownListItem(content, className, speaker);
    
    case 'html':
      return generateHtmlListItem(content, className, speaker);
    
    case 'json':
      return generateJsonListItem(content, className, speaker);
    
    case 'yaml':
      return generateYamlListItem(content, className, speaker);
    
    case 'xml':
      return generateXmlListItem(content, className, speaker);
    
    case 'text':
    default:
      return generateTextListItem(content, className, speaker);
  }
}

function generateMarkdownListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('div', { className, 'data-speaker': speaker }, `- ${content}`);
}

function generateHtmlListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('li', { className, 'data-speaker': speaker }, content);
}

function generateJsonListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'list-item', content };
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: list-item\ncontent: ${JSON.stringify(content)}`;
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  const xml = `<list-item>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</list-item>`;
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextListItem(
  content: string,
  className?: string,
  speaker?: string
): Component {
  return createElement('div', { className, 'data-speaker': speaker }, `- ${content}`);
}