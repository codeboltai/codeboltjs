import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface NewlineProps extends BaseComponentProps {
  /** Number of newlines to insert */
  count?: number;
}

export function Newline(props: NewlineProps): Component {
  const {
    count = 1,
    syntax = 'markdown',
    className,
    speaker
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownNewline(count, className, speaker);
    
    case 'html':
      return generateHtmlNewline(count, className, speaker);
    
    case 'json':
      return generateJsonNewline(count, className, speaker);
    
    case 'yaml':
      return generateYamlNewline(count, className, speaker);
    
    case 'xml':
      return generateXmlNewline(count, className, speaker);
    
    case 'text':
    default:
      return generateTextNewline(count, className, speaker);
  }
}

function generateMarkdownNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, '\n'.repeat(count));
}

function generateHtmlNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  const breaks = Array(count).fill('<br>').join('');
  return createElement('span', { className, 'data-speaker': speaker }, breaks);
}

function generateJsonNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  const obj = { type: 'newline', count };
  return createElement('span', { className, 'data-speaker': speaker }, JSON.stringify(obj));
}

function generateYamlNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  const yaml = `type: newline\ncount: ${count}`;
  return createElement('span', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  const xml = `<newline count="${count}" />`;
  return createElement('span', { className, 'data-speaker': speaker }, xml);
}

function generateTextNewline(
  count: number,
  className?: string,
  speaker?: string
): Component {
  return createElement('span', { className, 'data-speaker': speaker }, '\n'.repeat(count));
}