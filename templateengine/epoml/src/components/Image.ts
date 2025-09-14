import { createElement } from '../core/createElement';
import { Component, BaseComponentProps } from '../types';

export interface ImageProps extends BaseComponentProps {
  /** Path to the image file. If provided, the file will be read and encoded as base64. */
  src?: string;
  /** Base64-encoded image data. Cannot be used together with src. */
  base64?: string;
  /** The alternative text to show when the image cannot be displayed. */
  alt?: string;
  /** The MIME type of the image (e.g., image/jpeg, image/png). If not specified, it will be inferred from the file extension. */
  type?: string;
  /** Position of the image. Can be one of: top, bottom, here. Default is here. */
  position?: 'top' | 'bottom' | 'here';
  /** Width of the image */
  width?: string | number;
  /** Height of the image */
  height?: string | number;
  /** Caption for the image */
  caption?: string;
}

export function Image(props: ImageProps): Component {
  const {
    src,
    base64,
    alt,
    type,
    position = 'here',
    width,
    height,
    caption,
    syntax = 'multimedia',
    className,
    speaker,
    children = []
  } = props;

  // If children are provided, use them instead of image data
  if (children.length > 0) {
    return createElement('div', { className, 'data-speaker': speaker }, ...children);
  }

  // Validate that only one of src or base64 is provided
  if (src && base64) {
    throw new Error('Cannot use both src and base64 properties together');
  }

  // Generate the component based on syntax
  switch (syntax) {
    case 'markdown':
      return generateMarkdownImage(src, base64, alt, caption, width, height, className, speaker);
    
    case 'html':
      return generateHtmlImage(src, base64, alt, type, width, height, caption, className, speaker);
    
    case 'json':
      return generateJsonImage(src, base64, alt, type, position, width, height, caption, className, speaker);
    
    case 'yaml':
      return generateYamlImage(src, base64, alt, type, position, width, height, caption, className, speaker);
    
    case 'xml':
      return generateXmlImage(src, base64, alt, type, position, width, height, caption, className, speaker);
    
    case 'multimedia':
      return generateMultimediaImage(src, base64, alt, type, width, height, caption, className, speaker);
    
    case 'text':
    default:
      return generateTextImage(src, base64, alt, caption, className, speaker);
  }
}

function generateMarkdownImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  caption: string | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (src || base64) {
    const imageUrl = base64 ? `data:image/png;base64,${base64}` : src || '';
    const altText = alt || 'Image';
    
    result = `![${altText}](${imageUrl})`;
    
    // Add dimensions if provided
    if (width || height) {
      result += `{`;
      if (width) result += ` width=${width}`;
      if (height) result += ` height=${height}`;
      result += ` }`;
    }
  } else if (alt) {
    result = `[${alt}]`;
  }
  
  if (caption) {
    result += `\n\n*${caption}*`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker }, result);
}

function generateHtmlImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  type: string | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let html = '';
  
  if (src || base64) {
    const imageUrl = base64 ? `data:${type || 'image/png'};base64,${base64}` : src || '';
    
    html = `<img src="${imageUrl}"`;
    
    if (alt) {
      html += ` alt="${escapeHtml(alt)}"`;
    }
    
    if (width) {
      html += ` width="${width}"`;
    }
    
    if (height) {
      html += ` height="${height}"`;
    }
    
    if (className) {
      html += ` class="${className}"`;
    }
    
    html += ' />';
    
    if (caption) {
      html = `<figure>${html}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
    }
  } else if (alt) {
    html = `<span class="image-alt">${escapeHtml(alt)}</span>`;
  }
  
  return createElement('div', { 'data-speaker': speaker }, html);
}

function generateJsonImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  type: string | undefined,
  position: 'top' | 'bottom' | 'here' | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  const image: any = {};
  
  if (src) {
    image.src = src;
  }
  
  if (base64) {
    image.base64 = base64;
  }
  
  if (alt) {
    image.alt = alt;
  }
  
  if (type) {
    image.type = type;
  }
  
  if (position) {
    image.position = position;
  }
  
  if (width) {
    image.width = width;
  }
  
  if (height) {
    image.height = height;
  }
  
  if (caption) {
    image.caption = caption;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, JSON.stringify(image, null, 2));
}

function generateYamlImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  type: string | undefined,
  position: 'top' | 'bottom' | 'here' | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let yaml = '';
  
  if (src) {
    yaml += `src: ${JSON.stringify(src)}\n`;
  }
  
  if (base64) {
    yaml += `base64: ${JSON.stringify(base64)}\n`;
  }
  
  if (alt) {
    yaml += `alt: ${JSON.stringify(alt)}\n`;
  }
  
  if (type) {
    yaml += `type: ${JSON.stringify(type)}\n`;
  }
  
  if (position) {
    yaml += `position: ${JSON.stringify(position)}\n`;
  }
  
  if (width) {
    yaml += `width: ${JSON.stringify(width)}\n`;
  }
  
  if (height) {
    yaml += `height: ${JSON.stringify(height)}\n`;
  }
  
  if (caption) {
    yaml += `caption: ${JSON.stringify(caption)}\n`;
  }
  
  return createElement('pre', { className, 'data-speaker': speaker }, yaml);
}

function generateXmlImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  type: string | undefined,
  position: 'top' | 'bottom' | 'here' | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let xml = '<image';
  
  if (src) {
    xml += ` src="${escapeXml(src)}"`;
  }
  
  if (alt) {
    xml += ` alt="${escapeXml(alt)}"`;
  }
  
  if (type) {
    xml += ` type="${escapeXml(type)}"`;
  }
  
  if (position) {
    xml += ` position="${position}"`;
  }
  
  if (width) {
    xml += ` width="${width}"`;
  }
  
  if (height) {
    xml += ` height="${height}"`;
  }
  
  if (className) {
    xml += ` class="${className}"`;
  }
  
  if (speaker) {
    xml += ` data-speaker="${speaker}"`;
  }
  
  xml += '>';
  
  if (base64) {
    xml += `\n  <base64>${escapeXml(base64)}</base64>`;
  }
  
  if (caption) {
    xml += `\n  <caption>${escapeXml(caption)}</caption>`;
  }
  
  xml += '\n</image>';
  
  return createElement('pre', { className, 'data-speaker': speaker }, xml);
}

function generateMultimediaImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  type: string | undefined,
  width: string | number | undefined,
  height: string | number | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  // For multimedia syntax, return a structured representation that can be processed by multimedia renderers
  let result = '';
  
  if (src || base64) {
    result = `[IMAGE: ${alt || 'Image'}]`;
    if (caption) {
      result += `\nCaption: ${caption}`;
    }
  } else if (alt) {
    result = `[${alt}]`;
  }
  
  return createElement('div', { className, 'data-speaker': speaker, 'data-type': 'image' }, result);
}

function generateTextImage(
  src: string | undefined,
  base64: string | undefined,
  alt: string | undefined,
  caption: string | undefined,
  className?: string,
  speaker?: string
): Component {
  let result = '';
  
  if (alt) {
    result = `[Image: ${alt}]`;
  } else if (src) {
    result = `[Image: ${src}]`;
  } else if (base64) {
    result = `[Image: Base64 data]`;
  } else {
    result = `[Image]`;
  }
  
  if (caption) {
    result += `\n${caption}`;
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