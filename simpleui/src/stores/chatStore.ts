import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  threads: Map<string, ChatMessage[]>;
  activeThreadId: string | null;
  isStreaming: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  agentStatus: 'idle' | 'thinking' | 'using_tool' | 'error';
  currentTool: string | null;
  tokenUsage: { used: number; total: number };
  
  addMessage: (message: ChatMessage) => void;
  setMessages: (threadId: string, messages: ChatMessage[]) => void;
  setActiveThread: (threadId: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAgentStatus: (status: ChatState['agentStatus']) => void;
  setCurrentTool: (tool: string | null) => void;
  setTokenUsage: (usage: { used: number; total: number }) => void;
  clearThread: (threadId: string) => void;
  getLastMessage: () => ChatMessage | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  threads: new Map(),
  activeThreadId: null,
  isStreaming: false,
  isConnected: false,
  isLoading: false,
  error: null,
  agentStatus: 'idle',
  currentTool: null,
  tokenUsage: { used: 0, total: 8000 },

  addMessage: (message) => {
    const { activeThreadId, threads } = get();
    set({ messages: [...get().messages, message] });
    
    if (activeThreadId) {
      const threadMessages = threads.get(activeThreadId) || [];
      threads.set(activeThreadId, [...threadMessages, message]);
      set({ threads: new Map(threads) });
    }
  },
  setMessages: (threadId, messages) => {
    const { threads } = get();
    threads.set(threadId, messages);
    if (get().activeThreadId === threadId) {
      set({ messages });
    }
    set({ threads: new Map(threads) });
  },
  setActiveThread: (threadId) => {
    const { threads } = get();
    set({ 
      activeThreadId: threadId,
      messages: threadId ? (threads.get(threadId) || []) : []
    });
  },
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setAgentStatus: (status) => set({ agentStatus: status }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setTokenUsage: (usage) => set({ tokenUsage: usage }),
  clearThread: (threadId) => {
    const { threads } = get();
    threads.delete(threadId);
    set({ threads: new Map(threads) });
  },
  getLastMessage: () => get().messages[get().messages.length - 1],
}));
