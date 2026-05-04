import React from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Bell,
  User,
  Settings,
  LogOut,
  Keyboard,
} from 'lucide-react';
import { useAppStore, useConnectionStore, useNotificationsStore } from '@/stores';
import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/utils';

const TopBar: React.FC = () => {
  const { theme, setTheme, toggleSidebar, privacyMode, setPrivacyMode } = useAppStore();
  const { isConnected } = useConnectionStore();
  const { unreadCount } = useNotificationsStore();

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  React.useEffect(() => {
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
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">CODEBOLT</span>
            <span className="text-xs text-muted-foreground -mt-1">MISSION CONTROL</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {privacyMode && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Demo Mode
          </span>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          <span className="text-muted-foreground hidden sm:inline">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPrivacyMode(!privacyMode)}
          title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
        >
          {privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
