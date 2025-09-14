import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface AiMessageProps extends BaseComponentProps {
  /** AI model name */
  model?: string;
  /** Confidence level */
  confidence?: number;
}

export function AiMessage(props: AiMessageProps): Component {
  const {
    model,
    confidence,
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
      return generateMarkdownAiMessage(model, confidence, content, className, speaker);
    
    case 'html':
      return generateHtmlAiMessage(model, confidence, content, className, speaker);
    
    case 'json':
      return generateJsonAiMessage(model, confidence, content, className, speaker);
    
    case 'yaml':
      return generateYamlAiMessage(model, confidence, content, className, speaker);
    
    case 'xml':
      return generateXmlAiMessage(model, confidence, content, className, speaker);
    
    case 'text':
    default:
      return generateTextAiMessage(model, confidence, content, className, speaker);
  }
}

function generateMarkdownAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = '**AI**';
  if (model) {
    prefix += ` (${model})`;
  }
  if (confidence !== undefined) {
    prefix += ` [${Math.round(confidence * 100)}%]`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}

function generateHtmlAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let html = '<div class="ai-message"';
  if (className) {
    html += ` class="${className}"`;
  }
  if (speaker) {
    html += ` data-speaker="${speaker}"`;
  }
  html += '>';
  
  html += '<strong>AI</strong>';
  if (model) {
    html += ` <em>(${model.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')})</em>`;
  }
  if (confidence !== undefined) {
    html += ` <span class="confidence">[${Math.round(confidence * 100)}%]</span>`;
  }
  
  html += `: ${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
  html += '</div>';
  
  return createElement('div', { className, 'data-speaker': speaker }, html);
}

function generateJsonAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  const obj: any = { type: 'ai-message', content };
  
  if (model) {
    obj.model = model;
  }
  
  if (confidence !== undefined) {
    obj.confidence = confidence;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, JSON.stringify(obj, null, 2));
}

function generateYamlAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let yaml = 'type: ai-message\ncontent: ${JSON.stringify(content)}\n';
  
  if (model) {
    yaml += `model: ${JSON.stringify(model)}\n`;
  }
  
  if (confidence !== undefined) {
    yaml += `confidence: ${confidence}\n`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let xml = '<ai-message';
  
  if (model) {
    xml += ` model="${model.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
  }
  
  if (confidence !== undefined) {
    xml += ` confidence="${confidence}"`;
  }
  
  xml += `>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</ai-message>`;
  
  return createElement('div', { className, 'data-speaker': speaker }, xml);
}

function generateTextAiMessage(
  model: string | undefined,
  confidence: number | undefined,
  content: string,
  className?: string,
  speaker?: string
): Component {
  let prefix = 'AI';
  if (model) {
    prefix += ` (${model})`;
  }
  if (confidence !== undefined) {
    prefix += ` [${Math.round(confidence * 100)}%]`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, `${prefix}: ${content}`);
}