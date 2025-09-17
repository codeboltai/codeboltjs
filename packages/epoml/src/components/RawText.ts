import { BaseComponentProps } from '../types';

export interface RawTextProps extends BaseComponentProps {
  /** The raw text content to display */
  content?: string;
  /** Whether to preserve whitespace and line breaks (default: true) */
  preserveWhitespace?: boolean;
  /** Whether to escape HTML entities in the raw text (default: false) */
  escapeHtml?: boolean;
}

export function RawText(props: RawTextProps): string {
  const {
    content,
    preserveWhitespace = true,
    escapeHtml = false,
    syntax = 'text',
    className,
    speaker,
    children = []
  } = props;

  // Use content prop if provided, otherwise extract from children as strings
  let rawContent: string;
  
  if (content !== undefined) {
    rawContent = content;
  } else {
    // Extract text content from children - treat everything as literal text
    rawContent = children.map(child => {
      if (typeof child === 'string') {
        return child;
      }
      // For non-string children, convert to string
      return String(child);
    }).join('');
  }


  // Process the content based on options
  let processedContent = rawContent;
  
  if (escapeHtml) {
    processedContent = processedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // For RawText, we just return the content directly as a string
  // No need for complex rendering - just preserve the content exactly as provided
  return processedContent;
}
