import { create } from 'zustand';
import type { Channel, RoutingRule } from '@/types';

interface ChannelsState {
  channels: Channel[];
  routingRules: RoutingRule[];
  defaultRoute: string;
  isLoading: boolean;
  error: string | null;
  
  setChannels: (channels: Channel[]) => void;
  addChannel: (channel: Channel) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  removeChannel: (id: string) => void;
  setRoutingRules: (rules: RoutingRule[]) => void;
  addRoutingRule: (rule: RoutingRule) => void;
  updateRoutingRule: (id: string, updates: Partial<RoutingRule>) => void;
  removeRoutingRule: (id: string) => void;
  setDefaultRoute: (agentId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getConnectedChannels: () => Channel[];
  getChannelById: (id: string) => Channel | undefined;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  routingRules: [],
  defaultRoute: '',
  isLoading: false,
  error: null,

  setChannels: (channels) => set({ channels, isLoading: false, error: null }),
  addChannel: (channel) => set((state) => ({ channels: [...state.channels, channel] })),
  updateChannel: (id, updates) =>
    set((state) => ({
      channels: state.channels.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  removeChannel: (id) =>
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== id),
    })),
  setRoutingRules: (rules) => set({ routingRules: rules }),
  addRoutingRule: (rule) =>
    set((state) => ({ routingRules: [...state.routingRules, rule] })),
  updateRoutingRule: (id, updates) =>
    set((state) => ({
      routingRules: state.routingRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  removeRoutingRule: (id) =>
    set((state) => ({
      routingRules: state.routingRules.filter((r) => r.id !== id),
    })),
  setDefaultRoute: (agentId) => set({ defaultRoute: agentId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  getConnectedChannels: () => get().channels.filter((c) => c.status === 'connected'),
  getChannelById: (id) => get().channels.find((c) => c.id === id),
}));
