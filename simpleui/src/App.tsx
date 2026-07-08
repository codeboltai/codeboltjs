import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui';
import { MainLayout, RedirectToDashboard } from '@/components/layout';
import { initializeSockets, disconnectSockets } from '@/services/socket';
import { useAppStore } from '@/stores';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const Tasks = React.lazy(() => import('@/pages/Tasks'));
const Missions = React.lazy(() => import('@/pages/Missions'));
const Projects = React.lazy(() => import('@/pages/Projects'));
const Schedules = React.lazy(() => import('@/pages/Schedules'));
const Agents = React.lazy(() => import('@/pages/Agents'));
const Skills = React.lazy(() => import('@/pages/Skills'));
const Templates = React.lazy(() => import('@/pages/Templates'));
const Channels = React.lazy(() => import('@/pages/Channels'));
const ChannelRouting = React.lazy(() => import('@/pages/ChannelRouting'));
const Files = React.lazy(() => import('@/pages/Files'));
const Preview = React.lazy(() => import('@/pages/Preview'));
const History = React.lazy(() => import('@/pages/History'));
const Feed = React.lazy(() => import('@/pages/Feed'));
const SquadComms = React.lazy(() => import('@/pages/SquadComms'));
const Approvals = React.lazy(() => import('@/pages/Approvals'));
const Usage = React.lazy(() => import('@/pages/Usage'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Integrations = React.lazy(() => import('@/pages/Integrations'));
const Logs = React.lazy(() => import('@/pages/SystemLogs'));

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  const { theme } = useAppStore();

  useEffect(() => {
    // Initialize WebSocket connections
    initializeSockets();

    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    return () => {
      disconnectSockets();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <TooltipProvider>
      <BrowserRouter basename={import.meta.env.VITE_BASENAME || '/ui'}>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<RedirectToDashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="missions" element={<Missions />} />
              <Route path="projects" element={<Projects />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/templates" element={<Templates />} />
              <Route path="skills" element={<Skills />} />
              <Route path="channels" element={<Channels />} />
              <Route path="channels/routing" element={<ChannelRouting />} />
              <Route path="files" element={<Files />} />
              <Route path="preview" element={<Preview />} />
              <Route path="history" element={<History />} />
              <Route path="feed" element={<Feed />} />
              <Route path="feed/squad" element={<SquadComms />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="usage" element={<Usage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/integrations" element={<Integrations />} />
              <Route path="settings/logs" element={<Logs />} />
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
