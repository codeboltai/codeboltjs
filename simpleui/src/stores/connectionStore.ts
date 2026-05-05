import { create } from 'zustand';

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected: string | null;
  latency: number;
  error: string | null;
  
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  setLastConnected: (time: string | null) => void;
  setLatency: (latency: number) => void;
  setError: (error: string | null) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  isReconnecting: false,
  lastConnected: null,
  latency: 0,
  error: null,

  setConnected: (connected) => set({ isConnected: connected, isReconnecting: false }),
  setReconnecting: (reconnecting) => set({ isReconnecting: reconnecting }),
  setLastConnected: (time) => set({ lastConnected: time }),
  setLatency: (latency) => set({ latency }),
  setError: (error) => set({ error }),
}));
