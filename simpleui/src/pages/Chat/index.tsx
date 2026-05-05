import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Loader2, RefreshCw, Info, Maximize2 } from 'lucide-react';
import { Button, Avatar } from '@/components/ui';
import { useChatStore, useConnectionStore } from '@/stores';
import { chatSocket } from '@/services/socket';
import { chatApi } from '@/services/api';
import { cn, formatTimeAgo } from '@/utils';
import type { ChatMessage } from '@/types';

const Chat: React.FC = () => {
  const {
    messages,
    activeThreadId,
    isStreaming,
    agentStatus,
    currentTool,
    tokenUsage,
    addMessage,
    setActiveThread,
    setAgentStatus,
  } = useChatStore();
  const { isConnected } = useConnectionStore();
  
  const [input, setInput] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatSocket.connect();
    
    chatSocket.on('message', (message) => {
      console.log('Received message:', message);
    });

    return () => {
      chatSocket.off('message', () => {});
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeThreadId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      threadId: activeThreadId,
      senderType: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    chatSocket.sendMessage(activeThreadId, input);
    setInput('');
    setAgentStatus('thinking');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    chatSocket.stopGeneration();
  };

  const createNewThread = async () => {
    try {
      const result = await chatApi.createThread('New Chat');
      setActiveThread(result.threadId);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  useEffect(() => {
    if (!activeThreadId) {
      createNewThread();
    }
  }, [activeThreadId]);

  const getStatusText = () => {
    switch (agentStatus) {
      case 'thinking':
        return 'Agent is thinking...';
      case 'using_tool':
        return `Agent is using tool: ${currentTool}`;
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <div className={cn(
                'h-full w-full flex items-center justify-center text-sm font-medium',
                'bg-primary text-primary-foreground'
              )}>
                A
              </div>
            </Avatar>
            <span className="font-medium">Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => chatSocket.connect()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Send a message to begin chatting with your agent</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.senderType === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.senderType !== 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <div className="h-full w-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {message.senderName?.charAt(0) || 'A'}
                  </div>
                </Avatar>
              )}
              <div
                className={cn(
                  'rounded-lg px-4 py-2 max-w-[70%]',
                  message.senderType === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatTimeAgo(message.timestamp)}
                </p>
              </div>
              {message.senderType === 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <div className="h-full w-full bg-secondary flex items-center justify-center text-sm">
                    U
                  </div>
                </Avatar>
              )}
            </div>
          ))}
          
          {isStreaming && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <div className="h-full w-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message (Enter to send, Shift+Enter for new line)"
              className="flex-1 resize-none rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '150px' }}
            />
            {isStreaming ? (
              <Button variant="destructive" size="icon" onClick={handleStop}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!input.trim() || !isConnected}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
          <span>{getStatusText()}</span>
          <span>{tokenUsage.used.toLocaleString()} tokens used</span>
        </div>
      </div>

      {/* Right Panel */}
      {showRightPanel && (
        <div className="w-80 border-l bg-muted/30">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Context</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Thread ID:</span>
                <p className="font-mono text-xs truncate">{activeThreadId || 'None'}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Tokens:</span>
                <p>{tokenUsage.used.toLocaleString()} / {tokenUsage.total.toLocaleString()}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Connection:</span>
                <p className={cn(isConnected ? 'text-green-500' : 'text-red-500')}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
