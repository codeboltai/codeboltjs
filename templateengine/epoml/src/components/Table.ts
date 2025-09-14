import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface TableProps extends BaseComponentProps {
      /** Table headers */
      headers?: string[];
      /** Table rows */
      rows?: string[][];
      /** Table caption */
      caption?: string;
      /** Whether to render with borders */
      bordered?: boolean;
      /** Whether to render with striped rows */
      striped?: boolean;
      /** Alignment for columns */
      align?: ('left' | 'center' | 'right')[];
    
}

export function Table(props: TableProps): Component {
      const {
        headers = [],
        rows = [],
        caption,
        bordered = false,
        striped = false,
        align = [],
        syntax = 'markdown',
        className,
        speaker,
        children = []
    
  } = props;

  // If children are provided, use them instead of headers/rows
  if (children.length > 0) {
    return createElement('div', { className, 'data-speaker': speaker }, ...children);
  }

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownTable(headers, rows, caption, className, speaker);
    
    case 'html':
      return generateHtmlTable(headers, rows, caption, bordered, striped, align, className, speaker);
    
    case 'json':
      return generateJsonTable(headers, rows, caption, className, speaker);
    
    case 'yaml':
      return generateYamlTable(headers, rows, caption, className, speaker);
    
    case 'xml':
      return generateXmlTable(headers, rows, caption, className, speaker);
    
    case 'text':
    default:
      return generateTextTable(headers, rows, caption, bordered, striped, align, className, speaker);
  }
}

function generateMarkdownTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (caption) {
    result += `Table: ${caption}\
\
`;
  }

  if (headers.length > 0) {
    result += '| ' + headers.join(' | ') + ' |\
';
    result += '| ' + headers.map(() => '---').join(' | ') + ' |\
';
  }

  for (const row of rows) {
    result += '| ' + row.join(' | ') + ' |\
';
  }

  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  bordered: boolean,
  striped: boolean,
  align: ('left' | 'center' | 'right')[],
  className?: string,
  speaker?: string
): Component {
  let html = `<table${className ? ` class=\"${className}\"` : ''}${speaker ? ` data-speaker=\"${speaker}\"` : ''}>`;
  
  if (caption) {
    html += `\
  <caption>${caption}</caption>`;
  }
  
  if (headers.length > 0) {
    html += '\
  <thead>\
    <tr>';
    headers.forEach((header, index) => {
      const alignAttr = align[index] ? ` align=\"${align[index]}\"` : '';
      html += `\
      <th${alignAttr}>${header}</th>`;
    });
    html += '\
    </tr>\
  </thead>';
  }
  
  if (rows.length > 0) {
    html += '\
  <tbody>';
    rows.forEach((row, rowIndex) => {
      const rowClass = striped && rowIndex % 2 === 1 ? ' class=\"striped\"' : '';
      html += `\
    <tr${rowClass}>`;
      row.forEach((cell, cellIndex) => {
        const alignAttr = align[cellIndex] ? ` align=\"${align[cellIndex]}\"` : '';
        html += `\
      <td${alignAttr}>${cell}</td>`;
      });
      html += '\
    </tr>';
    });
    html += '\
  </tbody>';
  }
  
  html += '\
</table>';
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  const table: any = {};
  
  if (caption) {
    table.caption = caption;
  }
  
  if (headers.length > 0) {
    table.headers = headers;
  }
  
  if (rows.length > 0) {
    table.rows = rows;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(table, null, 2));
}

function generateYamlTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let yaml = '';
  
  if (caption) {
    yaml += `caption: ${JSON.stringify(caption)}\
`;
  }
  
  if (headers.length > 0) {
    yaml += `headers:\
${headers.map(header => `  - ${JSON.stringify(header)}`).join('\
')}\
`;
  }
  
  if (rows.length > 0) {
    yaml += `rows:\
${rows.map(row => `  - [${row.map(cell => JSON.stringify(cell)).join(', ')}]`).join('\
')}\
`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let xml = `<table${className ? ` class=\"${className}\"` : ''}${speaker ? ` data-speaker=\"${speaker}\"` : ''}>`;
  
  if (caption) {
    xml += `\
  <caption>${caption}</caption>`;
  }
  
  if (headers.length > 0) {
    xml += '\
  <headers>';
    headers.forEach(header => {
      xml += `\
    <header>${header}</header>`;
    });
    xml += '\
  </headers>';
  }
  
  if (rows.length > 0) {
    xml += '\
  <rows>';
    rows.forEach(row => {
      xml += '\
    <row>';
      row.forEach(cell => {
        xml += `\
      <cell>${cell}</cell>`;
      });
      xml += '\
    </row>';
    });
    xml += '\
  </rows>';
  }
  
  xml += '\
</table>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateTextTable(
  headers: string[],
  rows: string[][],
  caption: string | undefined,
  bordered: boolean,
  striped: boolean,
  align: ('left' | 'center' | 'right')[],
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (caption) {
    result += `Table: ${caption}\
\
`;
  }

  // For simplicity, we'll create a basic text table
  if (headers.length > 0) {
    result += headers.join(' | ') + '\
';
    result += headers.map(() => '---').join(' | ') + '\
';
  }

  for (const row of rows) {
    result += row.join(' | ') + '\
';
  }

  return createElement('div', { className, 'data-speaker': speaker }, result);
}