import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useAppStore, useConnectionStore } from '@/stores';
import { cn } from '@/utils';

const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();
  const { isConnected } = useConnectionStore();

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main
          className={cn(
            'flex-1 overflow-auto',
            sidebarCollapsed ? 'ml-0' : 'ml-0'
          )}
        >
          <Outlet />
        </main>
      </div>
      
      {!isConnected && (
        <div className="fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground py-2 px-4 text-center text-sm">
          Connection lost. Attempting to reconnect...
        </div>
      )}
    </div>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, allow access without authentication
  // In production, check for valid session
  return <>{children}</>;
};

export const RedirectToDashboard: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default MainLayout;
