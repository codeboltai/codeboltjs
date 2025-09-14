import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface QuestionProps extends BaseComponentProps {
  /** Question text */
  text: string;
  /** Question type */
  type?: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating';
  /** Question options (for multiple-choice and single-choice) */
  options?: string[];
  /** Correct answer(s) */
  answer?: string | string[];
  /** Question explanation */
  explanation?: string;
  /** Question difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Question category */
  category?: string;
}

export function Question(props: QuestionProps): Component {
  const {
    text,
    type = 'open-ended',
    options = [],
    answer,
    explanation,
    difficulty = 'medium',
    category,
    syntax = 'markdown',
    className,
    speaker,
    children = []
  } = props;

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
    
    case 'html':
      return generateHtmlQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
    
    case 'json':
      return generateJsonQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
    
    case 'yaml':
      return generateYamlQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
    
    case 'xml':
      return generateXmlQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
    
    case 'text':
    default:
      return generateTextQuestion(text, type, options, answer, explanation, difficulty, category, children, className, speaker);
  }
}

function generateMarkdownQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  // Difficulty emoji
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'hard': '🔴'
  }[difficulty];
  
  result += `## ${difficultyEmoji} Question\n\n`;
  result += `**${text}**\n\n`;
  
  if (category) {
    result += `*Category: ${category}*\n\n`;
  }
  
  if (type !== 'open-ended') {
    result += `*Type: ${type}*\n\n`;
  }
  
  if (options.length > 0) {
    result += '### Options\n\n';
    options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D...
      result += `${letter}. ${option}\n`;
    });
    result += '\n';
  }
  
  if (answer !== undefined) {
    result += '### Answer\n\n';
    if (Array.isArray(answer)) {
      result += `- ${answer.join(', ')}\n\n`;
    } else {
      result += `- ${answer}\n\n`;
    }
  }
  
  if (explanation) {
    result += '### Explanation\n\n';
    result += `${explanation}\n\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Difficulty emoji
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'hard': '🔴'
  }[difficulty];
  
  let html = `<div class="question${className ? ` ${className}` : ''}"${speaker ? ` data-speaker="${speaker}"` : ''}>\n`;
  html += `  <h2>${difficultyEmoji} Question</h2>\n`;
  html += `  <p class="question-text"><strong>${escapeHtml(text)}</strong></p>\n`;
  
  if (category) {
    html += `  <p class="question-category"><em>Category: ${escapeHtml(category)}</em></p>\n`;
  }
  
  if (type !== 'open-ended') {
    html += `  <p class="question-type"><em>Type: ${type}</em></p>\n`;
  }
  
  if (options.length > 0) {
    html += '  <h3>Options</h3>\n';
    html += '  <ol type="A">\n';
    options.forEach(option => {
      html += `    <li>${escapeHtml(option)}</li>\n`;
    });
    html += '  </ol>\n';
  }
  
  if (answer !== undefined) {
    html += '  <h3>Answer</h3>\n';
    html += '  <div class="question-answer">\n';
    if (Array.isArray(answer)) {
      html += `    <ul><li>${answer.map(a => escapeHtml(a)).join('</li><li>')}</li></ul>\n`;
    } else {
      html += `    <p>${escapeHtml(answer as string)}</p>\n`;
    }
    html += '  </div>\n';
  }
  
  if (explanation) {
    html += '  <h3>Explanation</h3>\n';
    html += `  <p class="question-explanation">${escapeHtml(explanation)}</p>\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    html += '  <div class="question-details">\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    html += `    ${childrenContent}\n`;
    html += '  </div>\n';
  }
  
  html += '</div>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  const question: any = {
    text,
    type,
    difficulty
  };
  
  if (category) {
    question.category = category;
  }
  
  if (options.length > 0) {
    question.options = options;
  }
  
  if (answer !== undefined) {
    question.answer = answer;
  }
  
  if (explanation) {
    question.explanation = explanation;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    question.details = childrenContent;
  }
  
  if (className) {
    question.className = className;
  }
  
  if (speaker) {
    question.speaker = speaker;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(question, null, 2));
}

function generateYamlQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Difficulty emoji
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'hard': '🔴'
  }[difficulty];
  
  let yaml = `text: ${JSON.stringify(text)}\ntype: ${type}\ndifficulty: ${difficulty}\n`;
  
  if (category) {
    yaml += `category: ${JSON.stringify(category)}\n`;
  }
  
  if (options.length > 0) {
    yaml += `options:\n${options.map(option => `  - ${JSON.stringify(option)}`).join('\n')}`;
  }
  
  if (answer !== undefined) {
    if (Array.isArray(answer)) {
      yaml += `\nanswer:\n${(answer as string[]).map(a => `  - ${JSON.stringify(a)}`).join('\n')}`;
    } else {
      yaml += `\nanswer: ${JSON.stringify(answer)}`;
    }
  }
  
  if (explanation) {
    yaml += `\nexplanation: ${JSON.stringify(explanation)}`;
  }
  
  // Add children content as a string
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    yaml += `\ndetails: |\n${childrenContent.split('\n').map(line => `  ${line}`).join('\n')}`;
  }
  
  if (className) {
    yaml += `\nclassName: ${JSON.stringify(className)}`;
  }
  
  if (speaker) {
    yaml += `\nspeaker: ${JSON.stringify(speaker)}`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  let xml = `<question text="${escapeXmlAttr(text)}" type="${type}" difficulty="${difficulty}"`;
  
  if (category) {
    xml += ` category="${escapeXmlAttr(category)}"`;
  }
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>\n';
  
  if (options.length > 0) {
    xml += '  <options>\n';
    options.forEach(option => {
      xml += `    <option>${escapeXml(option)}</option>\n`;
    });
    xml += '  </options>\n';
  }
  
  if (answer !== undefined) {
    xml += '  <answer>\n';
    if (Array.isArray(answer)) {
      (answer as string[]).forEach(a => {
        xml += `    <value>${escapeXml(a)}</value>\n`;
      });
    } else {
      xml += `    <value>${escapeXml(answer as string)}</value>\n`;
    }
    xml += '  </answer>\n';
  }
  
  if (explanation) {
    xml += `  <explanation>${escapeXml(explanation)}</explanation>\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    xml += `  <details>${escapeXml(childrenContent)}</details>\n`;
  }
  
  xml += '</question>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextQuestion(
  text: string,
  type: 'multiple-choice' | 'single-choice' | 'open-ended' | 'true-false' | 'rating',
  options: string[],
  answer: string | string[] | undefined,
  explanation: string | undefined,
  difficulty: 'easy' | 'medium' | 'hard',
  category: string | undefined,
  children: (Component | string)[],
  className?: string,
  speaker?: string
): Component {
  // Difficulty emoji
  const difficultyEmoji = {
    'easy': '🟢',
    'medium': '🟡',
    'hard': '🔴'
  }[difficulty];
  
  let result = `QUESTION: ${difficultyEmoji} ${text}\n`;
  result += '='.repeat(Math.max(9, text.length + 10)) + '\n\n';
  
  if (category) {
    result += `Category: ${category}\n`;
  }
  
  if (type !== 'open-ended') {
    result += `Type: ${type}\n`;
  }
  
  result += `Difficulty: ${difficulty}\n\n`;
  
  if (options.length > 0) {
    result += 'Options:\n';
    result += '-------\n';
    options.forEach((option, index) => {
      const letter = String.fromCharCode(65 + index); // A, B, C, D...
      result += `${letter}. ${option}\n`;
    });
    result += '\n';
  }
  
  if (answer !== undefined) {
    result += 'Answer:\n';
    result += '------\n';
    if (Array.isArray(answer)) {
      result += `- ${answer.join(', ')}\n\n`;
    } else {
      result += `- ${answer}\n\n`;
    }
  }
  
  if (explanation) {
    result += 'Explanation:\n';
    result += '-----------\n';
    result += `${explanation}\n\n`;
  }
  
  // Add children content
  if (children.length > 0) {
    result += 'Details:\n';
    result += '-------\n';
    const childrenContent = children.map(child => typeof child === 'string' ? child : '').join('');
    result += childrenContent;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}