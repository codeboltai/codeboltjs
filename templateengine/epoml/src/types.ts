// Common types used across EPOML components

/** Available syntax types for content rendering */
export type Syntax = 'markdown' | 'html' | 'json' | 'yaml' | 'xml' | 'text' | 'multimedia';

/** Speaker types for content attribution */
export type Speaker = 'human' | 'ai' | 'system';

/** Whitespace handling options */
export type WhitespaceHandling = 'pre' | 'filter' | 'trim';

/** Audio position options */
export type AudioPosition = 'top' | 'bottom' | 'here';

/** Caption style options */
export type CaptionStyle = 'header' | 'bold' | 'plain' | 'hidden';

/** Text transformation options */
export type TextTransform = 'upper' | 'level' | 'capitalize' | 'none';

/** Caption ending options */
export type CaptionEnding = 'colon' | 'newline' | 'colon-newline' | 'none';

/** Header level options */
export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Base properties shared by many components */
export interface BaseComponentProps {
  /** The syntax of the content */
  syntax?: Syntax;
  /** A class name for quickly styling the current block with stylesheets */
  className?: string;
  /** The speaker of the content */
  speaker?: Speaker;
  /** Experimental. Optional JSON string to customize the format of markdown headers, JSON indents, etc. */
  writerOptions?: object;
  /** Experimental. Controls how whitespace is handled in text content */
  whiteSpace?: WhitespaceHandling;
  /** Children content */
  children?: (Component | string)[];
}

/** Extended properties for components that support serialization */
export interface SerializableComponentProps extends BaseComponentProps {
  /** The name of the content, used in serialization */
  name?: string;
  /** The type of the content, used in serialization */
  type?: string;
}

/** Extended properties for components that support layout */
export interface LayoutComponentProps extends SerializableComponentProps {
  /** Whether to add one more blank line (2 in total) before and after the paragraph */
  blankLine?: boolean;
}

/** Extended properties for components that support content limits */
export interface LimitedComponentProps extends LayoutComponentProps {
  /** Experimental. Soft character limit before truncation is applied */
  charLimit?: number;
  /** Experimental. Soft token limit before truncation is applied */
  tokenLimit?: number;
  /** Experimental. Priority used when truncating globally. Lower numbers are dropped first */
  priority?: number;
}

/** Component type as used in the EPOML system */
export interface Component {
  type: string | Function;
  props: { [key: string]: any };
  children: (Component | string)[];
}

/** Audio MIME types */
export type AudioMimeType = 
  | 'audio/mpeg' 
  | 'audio/wav' 
  | 'audio/ogg' 
  | 'audio/mp4' 
  | 'audio/flac' 
  | 'audio/webm'
  | string; // Allow custom MIME types

/** Template variables for epomlparse function */
export type TemplateVariables = Record<string, any>;