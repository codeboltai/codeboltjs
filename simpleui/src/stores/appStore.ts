import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, User, Notification } from '@/types';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  sidebarSections: Record<string, boolean>;
  privacyMode: boolean;
  currentUser: User | null;
  settings: AppSettings | null;
  notifications: Notification[];
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  toggleSidebarSection: (section: string) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setSettings: (settings: AppSettings) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      sidebarSections: {
        home: true,
        work: true,
        agents: true,
        channels: true,
        files: true,
        activity: true,
        settings: true,
      },
      privacyMode: false,
      currentUser: null,
      settings: null,
      notifications: [],

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleSidebarSection: (section) =>
        set((state) => ({
          sidebarSections: { ...state.sidebarSections, [section]: !state.sidebarSections[section] },
        })),
      setPrivacyMode: (enabled) => set({ privacyMode: enabled }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setSettings: (settings) => set({ settings }),
      addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'codebolt-mission-control',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarSections: state.sidebarSections,
        privacyMode: state.privacyMode,
      }),
    }
  )
);
