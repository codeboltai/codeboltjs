import { BaseSendMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendMessage Node - actual implementation
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();
    // Backend doesn't need any additional UI widgets or setup
  }


  // Handle execution - this will be called when triggered by the event
  async onExecute() {
    console.log('[Utkarsh1] SendMessageNode onExecute called');
    console.log('[Utkarsh1] Node inputs count:', this.inputs?.length);
    console.log('[Utkarsh1] Input connections:', this.inputs?.map((input, idx) => ({ 
      slot: idx, 
      name: input.name, 
      type: input.type,
      connected: input.link !== null,
      data: this.getInputData(idx) 
    })));
    
    // Get the message from input named "message" (or property fallback)
    let messageToSend: any = (this as any).getInputOrProperty?.('message') ?? this.getInputData(1);
    console.log('[Utkarsh1] Raw input data (by name "message"):', messageToSend);
    console.log('[Utkarsh1] Type of input data:', typeof messageToSend);

    // Fallback: if still undefined, try to read from the triggering OnMessageNode
    if (messageToSend === undefined || messageToSend === null) {
      try {
        const triggerInput = this.inputs?.[0]; // onTrigger
        if (triggerInput?.link != null && (this as any).graph?._links) {
          const graph = (this as any).graph;
          const link = graph._links.get(triggerInput.link);
          if (link) {
            const originNode = graph.getNodeById(link.origin_id) as any;
            if (originNode) {
              const fromOutput = originNode.getOutputData?.(1); // userMessage or message
              const fromProps = originNode.properties?.message;
              messageToSend = fromOutput ?? fromProps ?? messageToSend;
              console.log('[SendMessageNode] Fallback message from origin node:', {
                fromOutput,
                fromProps,
                final: messageToSend,
              });

              // Also propagate this value into our "message" input link so getInputData works
              const messageInput = this.inputs?.[1];
              if (messageInput?.link != null) {
                const msgLink = graph._links.get(messageInput.link);
                if (msgLink) {
                  msgLink.data = messageToSend;
                  console.log('[SendMessageNode] Wrote fallback message into input link.data');
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('[SendMessageNode] Fallback origin message lookup failed', e);
      }
    }

    console.log("[utkarsh4] the message is ", messageToSend);

    // Debug inputs after fallback so getInputData reflects any propagated value
    console.log('[SendMessageNode] Input connections after fallback:', this.inputs?.map((input, idx) => ({
      slot: idx,
      name: input.name,
      type: input.type,
      connected: input.link !== null,
      data: this.getInputData(idx)
    })));
    
    // Handle different types of input data
    let finalMessage = "Hi Data"; // default fallback
    
    if (messageToSend) {
      if (typeof messageToSend === 'string') {
        finalMessage = messageToSend;
      } else if (typeof messageToSend === 'object' && messageToSend.userMessage) {
        // If we get the full message object, extract the userMessage
        finalMessage = messageToSend.userMessage;
      } else {
        // Convert to string if it's something else
        finalMessage = String(messageToSend);
      }
    }
    
    console.log('[utkarsh3] the final message is ', finalMessage);
    console.log('[utkarsh3] final message type:', typeof finalMessage);
    // Validate the input message
    if (typeof finalMessage !== 'string' || !finalMessage.trim()) {
      const errorMessage = 'Error: Message cannot be empty';
      console.error('SendMessageNode error:', errorMessage);
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      return;
    }

    console.log('SendMessageNode: Sending message:', finalMessage);

    try {
      // Call codebolt.chat.sendMessage with the validated message
      await codebolt.chat.sendMessage(finalMessage);
      console.log('[utkarsh2]:SendMessageNode: Message sent successfully');

      // Update outputs with success results
      this.setOutputData(0, "done");
      this.setOutputData(1, true);

    } catch (error) {
      const errorMessage = `Error: Failed to send message`;
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      console.error('SendMessageNode error:', error);
    }
  }
}
