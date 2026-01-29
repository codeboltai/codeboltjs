import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '../../processor';

export interface HandleUrlMessageModifierOptions {
    googleSearchEnabled?: boolean;
    fetchUrlContent?: boolean;
}

export class HandleUrlMessageModifier extends BaseMessageModifier {
    private readonly googleSearchEnabled: boolean;
    private readonly fetchUrlContent: boolean;

    constructor(options: HandleUrlMessageModifierOptions = {}) {
        super({ context: options });
        this.googleSearchEnabled = options.googleSearchEnabled || false;
        this.fetchUrlContent = options.fetchUrlContent || false;
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            // Check if the request contains URLs
            const urls = this.extractUrls(originalRequest);
            
            if (urls.length > 0) {
                let contextContent = `URLs detected: ${urls.join(', ')}. ${this.googleSearchEnabled ? 'Google search is enabled.' : 'Google search is disabled.'}`;
                
                // Fetch URL content if enabled
                if (this.fetchUrlContent) {
                    contextContent += '\n\nURL Content Fetching: Enabled (content would be fetched in a real implementation)';
                    // In a real implementation, you would fetch the content here
                    // const urlContents = await Promise.all(urls.map(url => this.fetchContent(url)));
                }
                
                // Add URL context to the message
                const urlContextMessage: Message = {
                    role: 'system',
                    content: contextContent,
                    name: 'url-detector'
                };

                return {
                    messages: [...createdMessage.messages, urlContextMessage],
                    metadata: {
                        ...createdMessage.metadata,
                        urlsDetected: urls,
                        googleSearchEnabled: this.googleSearchEnabled,
                        fetchUrlContent: this.fetchUrlContent
                    }
                };
            }

            return createdMessage;
        } catch (error) {
            console.error('Error in HandleUrlMessageModifier:', error);
            throw error;
        }
    }

    private extractUrls(request: any): string[] {
        if (typeof request === 'string') {
            const urlRegex = /https?:\/\/[^\s]+/g;
            return request.match(urlRegex) || [];
        }
        
        if (typeof request === 'object' && request !== null) {
            const requestString = JSON.stringify(request);
            const urlRegex = /https?:\/\/[^\s]+/g;
            return requestString.match(urlRegex) || [];
        }
        
        return [];
    }
}
