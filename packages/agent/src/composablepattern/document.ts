/**
 * @fileoverview Document handling for Composable Agent Pattern
 * @description Provides document processing, chunking, and embedding capabilities
 */

import type { DocumentConfig, ProcessedDocument } from './types';

/**
 * Document processing and management class
 */
export class MDocument {
  private content: string;
  private type: string;
  private metadata: Record<string, any>;
  private chunks?: string[];
  private embeddings?: number[][];

  constructor(content: string, type: string = 'text', metadata: Record<string, any> = {}) {
    this.content = content;
    this.type = type;
    this.metadata = {
      ...metadata,
      createdAt: new Date().toISOString(),
      wordCount: this.countWords(content),
      charCount: content.length
    };
  }

  /**
   * Create MDocument from plain text
   * 
   * @param text - Plain text content
   * @param metadata - Optional metadata
   * @returns MDocument instance
   */
  static fromText(text: string, metadata?: Record<string, any>): MDocument {
    return new MDocument(text, 'text', metadata);
  }

  /**
   * Create MDocument from markdown
   * 
   * @param markdown - Markdown content
   * @param metadata - Optional metadata
   * @returns MDocument instance
   */
  static fromMarkdown(markdown: string, metadata?: Record<string, any>): MDocument {
    return new MDocument(markdown, 'markdown', metadata);
  }

  /**
   * Create MDocument from JSON
   * 
   * @param json - JSON object or string
   * @param metadata - Optional metadata
   * @returns MDocument instance
   */
  static fromJSON(json: any, metadata?: Record<string, any>): MDocument {
    const content = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    return new MDocument(content, 'json', metadata);
  }

  /**
   * Create MDocument from file path
   * 
   * @param filePath - Path to the file
   * @param metadata - Optional metadata
   * @returns Promise<MDocument> instance
   */
  static async fromFile(filePath: string, metadata?: Record<string, any>): Promise<MDocument> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const content = await fs.readFile(filePath, 'utf-8');
    const extension = path.extname(filePath).toLowerCase();
    
    let type = 'text';
    if (extension === '.md') type = 'markdown';
    else if (extension === '.json') type = 'json';
    else if (extension === '.xml') type = 'xml';
    
    const fileMetadata = {
      ...metadata,
      filePath,
      fileName: path.basename(filePath),
      fileExtension: extension
    };

    return new MDocument(content, type, fileMetadata);
  }

  /**
   * Get document content
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Get document type
   */
  getType(): string {
    return this.type;
  }

  /**
   * Get document metadata
   */
  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  /**
   * Update document metadata
   * 
   * @param metadata - Metadata to merge
   */
  updateMetadata(metadata: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...metadata,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Chunk the document into smaller pieces
   * 
   * @param options - Chunking options
   * @returns Array of text chunks
   */
  chunk(options: {
    size?: number;
    overlap?: number;
    strategy?: 'sentence' | 'paragraph' | 'fixed' | 'semantic';
  } = {}): string[] {
    const {
      size = 1000,
      overlap = 100,
      strategy = 'paragraph'
    } = options;

    let chunks: string[];

    switch (strategy) {
      case 'sentence':
        chunks = this.chunkBySentence(size, overlap);
        break;
      case 'paragraph':
        chunks = this.chunkByParagraph(size, overlap);
        break;
      case 'semantic':
        chunks = this.chunkSemantic(size, overlap);
        break;
      case 'fixed':
      default:
        chunks = this.chunkFixed(size, overlap);
        break;
    }

    this.chunks = chunks;
    this.updateMetadata({ 
      chunkCount: chunks.length,
      chunkStrategy: strategy,
      chunkSize: size,
      chunkOverlap: overlap
    });

    return chunks;
  }

  /**
   * Get existing chunks or create them if they don't exist
   */
  getChunks(): string[] {
    if (!this.chunks) {
      return this.chunk();
    }
    return this.chunks;
  }

  /**
   * Set embeddings for the document or its chunks
   * 
   * @param embeddings - Array of embedding vectors
   */
  setEmbeddings(embeddings: number[][]): void {
    this.embeddings = embeddings;
    this.updateMetadata({ 
      hasEmbeddings: true,
      embeddingCount: embeddings.length,
      embeddingDimension: embeddings[0]?.length || 0
    });
  }

  /**
   * Get embeddings
   */
  getEmbeddings(): number[][] | undefined {
    return this.embeddings;
  }

  /**
   * Convert to processed document format
   */
  toProcessedDocument(): ProcessedDocument {
    return {
      content: this.content,
      chunks: this.chunks,
      metadata: this.metadata,
      embeddings: this.embeddings
    };
  }

  /**
   * Convert to plain object
   */
  toJSON(): DocumentConfig & { chunks?: string[]; embeddings?: number[][] } {
    return {
      content: this.content,
      type: this.type as any,
      metadata: this.metadata,
      chunks: this.chunks,
      embeddings: this.embeddings
    };
  }

  /**
   * Create MDocument from processed document
   * 
   * @param processed - Processed document data
   * @returns MDocument instance
   */
  static fromProcessedDocument(processed: ProcessedDocument): MDocument {
    const doc = new MDocument(
      processed.content,
      processed.metadata.type || 'text',
      processed.metadata
    );
    
    if (processed.chunks) {
      doc.chunks = processed.chunks;
    }
    
    if (processed.embeddings) {
      doc.embeddings = processed.embeddings;
    }
    
    return doc;
  }

  /**
   * Extract text content based on document type
   */
  extractText(): string {
    switch (this.type) {
      case 'markdown':
        return this.extractMarkdownText();
      case 'json':
        return this.extractJSONText();
      case 'xml':
        return this.extractXMLText();
      default:
        return this.content;
    }
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Fixed-size chunking with overlap
   */
  private chunkFixed(size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < this.content.length) {
      const end = Math.min(start + size, this.content.length);
      chunks.push(this.content.slice(start, end));
      
      if (end === this.content.length) break;
      start = end - overlap;
    }

    return chunks;
  }

  /**
   * Sentence-based chunking
   */
  private chunkBySentence(size: number, overlap: number): string[] {
    const sentences = this.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;

    for (const sentence of sentences) {
      const sentenceSize = sentence.length;
      
      if (currentSize + sentenceSize > size && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Handle overlap by keeping some sentences
        if (overlap > 0) {
          const overlapSentences = currentChunk.split(/[.!?]+/).slice(-Math.ceil(overlap / 100));
          currentChunk = overlapSentences.join('. ') + '. ';
          currentSize = currentChunk.length;
        } else {
          currentChunk = '';
          currentSize = 0;
        }
      }
      
      currentChunk += sentence + '. ';
      currentSize += sentenceSize;
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Paragraph-based chunking
   */
  private chunkByParagraph(size: number, overlap: number): string[] {
    const paragraphs = this.content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;

    for (const paragraph of paragraphs) {
      const paragraphSize = paragraph.length;
      
      if (currentSize + paragraphSize > size && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Handle overlap
        if (overlap > 0) {
          const words = currentChunk.split(/\s+/);
          const overlapWords = words.slice(-overlap);
          currentChunk = overlapWords.join(' ') + ' ';
          currentSize = currentChunk.length;
        } else {
          currentChunk = '';
          currentSize = 0;
        }
      }
      
      currentChunk += paragraph + '\n\n';
      currentSize += paragraphSize;
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Semantic chunking (basic implementation)
   */
  private chunkSemantic(size: number, overlap: number): string[] {
    // For now, fall back to paragraph chunking
    // In a full implementation, this would use NLP techniques
    return this.chunkByParagraph(size, overlap);
  }

  /**
   * Extract text from markdown
   */
  private extractMarkdownText(): string {
    // Simple markdown text extraction
    return this.content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .trim();
  }

  /**
   * Extract text from JSON
   */
  private extractJSONText(): string {
    try {
      const obj = JSON.parse(this.content);
      return this.extractTextFromObject(obj);
    } catch {
      return this.content;
    }
  }

  /**
   * Extract text from XML
   */
  private extractXMLText(): string {
    // Simple XML text extraction
    return this.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Recursively extract text from object
   */
  private extractTextFromObject(obj: any): string {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'boolean') return obj.toString();
    if (obj === null || obj === undefined) return '';
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.extractTextFromObject(item)).join(' ');
    }
    
    if (typeof obj === 'object') {
      return Object.values(obj).map(value => this.extractTextFromObject(value)).join(' ');
    }
    
    return '';
  }
}
