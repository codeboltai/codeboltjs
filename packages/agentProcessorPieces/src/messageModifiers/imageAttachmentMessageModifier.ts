import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '@codebolt/agentprocessorframework';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ImageAttachmentMessageModifierOptions {
    passImageAs?: 'URL' | 'Base64' | 'Path';
    supportedFormats?: string[];
    maxImageSize?: number; // in bytes
}

export class ImageAttachmentMessageModifier extends BaseMessageModifier {
    private readonly passImageAs: 'URL' | 'Base64' | 'Path';
    private readonly supportedFormats: string[];
    private readonly maxImageSize: number;

    constructor(options: ImageAttachmentMessageModifierOptions = {}) {
        super({ context: options });
        this.passImageAs = options.passImageAs || 'URL';
        this.supportedFormats = options.supportedFormats || ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
        this.maxImageSize = options.maxImageSize || 10 * 1024 * 1024; // 10MB default
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            // Extract image references from the request
            const imageReferences = this.extractImageReferences(originalRequest);
            
            if (imageReferences.length === 0) {
                return createdMessage;
            }
            
            const processedImages: any[] = [];
            
            for (const imageRef of imageReferences) {
                try {
                    const processedImage = await this.processImage(imageRef);
                    if (processedImage) {
                        processedImages.push(processedImage);
                    }
                } catch (error) {
                    console.error(`Error processing image ${imageRef}:`, error);
                }
            }
            
            if (processedImages.length === 0) {
                return createdMessage;
            }
            
            // Add image context message
            const imageContextMessage: Message = {
                role: 'system',
                content: `Images attached to this conversation (${this.passImageAs} format):\n${processedImages.map((img, idx) => `${idx + 1}. ${img.description || img.reference}`).join('\n')}`,
                name: 'image-attachments'
            };

            // Modify user messages to include image references
            const modifiedMessages = createdMessage.messages.map(message => {
                if (message.role === 'user') {
                    return {
                        ...message,
                        attachments: processedImages
                    };
                }
                return message;
            });

            return {
                messages: [imageContextMessage, ...modifiedMessages],
                metadata: {
                    ...createdMessage.metadata,
                    imagesAttached: processedImages.length,
                    imageFormat: this.passImageAs,
                    processedImages
                }
            };
        } catch (error) {
            console.error('Error in ImageAttachmentMessageModifier:', error);
            throw error;
        }
    }

    private extractImageReferences(request: any): string[] {
        const imageRefs: string[] = [];
        
        if (typeof request === 'string') {
            // Look for image file paths or URLs
            const imageRegex = /(?:\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|bmp))/gi;
            const matches = request.match(imageRegex);
            if (matches) {
                imageRefs.push(...matches);
            }
        }
        
        if (typeof request === 'object' && request !== null) {
            // Look for image properties in the request object
            const searchForImages = (obj: any): void => {
                if (Array.isArray(obj)) {
                    obj.forEach(searchForImages);
                } else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(value => {
                        if (typeof value === 'string' && this.isImagePath(value)) {
                            imageRefs.push(value);
                        } else if (typeof value === 'object') {
                            searchForImages(value);
                        }
                    });
                }
            };
            
            searchForImages(request);
        }
        
        return [...new Set(imageRefs)]; // Remove duplicates
    }

    private isImagePath(str: string): boolean {
        const ext = path.extname(str).toLowerCase();
        return this.supportedFormats.includes(ext) || /^https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp|bmp)/i.test(str);
    }

    private async processImage(imageRef: string): Promise<any | null> {
        try {
            if (imageRef.startsWith('http')) {
                // URL image
                return this.processUrlImage(imageRef);
            } else {
                // Local file path
                return this.processLocalImage(imageRef);
            }
        } catch (error) {
            console.error(`Error processing image ${imageRef}:`, error);
            return null;
        }
    }

    private async processUrlImage(url: string): Promise<any> {
        switch (this.passImageAs) {
            case 'URL':
                return {
                    type: 'url',
                    reference: url,
                    description: `Image from URL: ${url}`
                };
            case 'Base64':
                // In a real implementation, you would fetch and convert to base64
                return {
                    type: 'base64',
                    reference: url,
                    description: `Image from URL (would be converted to base64): ${url}`,
                    note: 'Base64 conversion not implemented for URLs in this demo'
                };
            case 'Path':
                return {
                    type: 'path',
                    reference: url,
                    description: `Image URL: ${url}`
                };
            default:
                return null;
        }
    }

    private async processLocalImage(filePath: string): Promise<any | null> {
        try {
            // Check if file exists and get stats
            const stats = await fs.stat(filePath);
            
            if (stats.size > this.maxImageSize) {
                console.warn(`Image ${filePath} is too large (${stats.size} bytes)`);
                return null;
            }
            
            switch (this.passImageAs) {
                case 'Path':
                    return {
                        type: 'path',
                        reference: filePath,
                        description: `Local image: ${path.basename(filePath)}`,
                        size: stats.size
                    };
                case 'Base64':
                    const imageBuffer = await fs.readFile(filePath);
                    const base64 = imageBuffer.toString('base64');
                    const ext = path.extname(filePath).substring(1);
                    return {
                        type: 'base64',
                        reference: `data:image/${ext};base64,${base64}`,
                        description: `Local image (base64): ${path.basename(filePath)}`,
                        size: stats.size
                    };
                case 'URL':
                    // Convert local path to file:// URL
                    return {
                        type: 'url',
                        reference: `file://${path.resolve(filePath)}`,
                        description: `Local image (file URL): ${path.basename(filePath)}`,
                        size: stats.size
                    };
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Error processing local image ${filePath}:`, error);
            return null;
        }
    }
}
