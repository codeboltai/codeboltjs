import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  Rocket,
  FolderKanban,
  Clock,
  Users,
  Wrench,
  Copy,
  Radio,
  GitBranch,
  FileBox,
  Eye,
  History,
  Activity,
  MessageCircle,
  CheckCircle2,
  DollarSign,
  Settings,
  Plug,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAppStore } from '@/stores';
import { Button } from '@/components/ui';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  title: string;
  key: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'HOME',
    key: 'home',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Chat', path: '/chat', icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    title: 'WORK',
    key: 'work',
    items: [
      { label: 'Task Board', path: '/tasks', icon: <ClipboardList className="h-4 w-4" /> },
      { label: 'Missions', path: '/missions', icon: <Rocket className="h-4 w-4" /> },
      { label: 'Projects', path: '/projects', icon: <FolderKanban className="h-4 w-4" /> },
      { label: 'Schedules', path: '/schedules', icon: <Clock className="h-4 w-4" /> },
    ],
  },
  {
    title: 'AGENTS',
    key: 'agents',
    items: [
      { label: 'Agent Roster', path: '/agents', icon: <Users className="h-4 w-4" /> },
      { label: 'Skills & Tools', path: '/skills', icon: <Wrench className="h-4 w-4" /> },
      { label: 'Templates', path: '/agents/templates', icon: <Copy className="h-4 w-4" /> },
    ],
  },
  {
    title: 'CHANNELS',
    key: 'channels',
    items: [
      { label: 'Channel Manager', path: '/channels', icon: <Radio className="h-4 w-4" /> },
      { label: 'Message Routing', path: '/channels/routing', icon: <GitBranch className="h-4 w-4" /> },
    ],
  },
  {
    title: 'FILES',
    key: 'files',
    items: [
      { label: 'File Browser', path: '/files', icon: <FileBox className="h-4 w-4" /> },
      { label: 'Preview', path: '/preview', icon: <Eye className="h-4 w-4" /> },
      { label: 'Version History', path: '/history', icon: <History className="h-4 w-4" /> },
    ],
  },
  {
    title: 'ACTIVITY',
    key: 'activity',
    items: [
      { label: 'Live Feed', path: '/feed', icon: <Activity className="h-4 w-4" /> },
      { label: 'Squad Comms', path: '/feed/squad', icon: <MessageCircle className="h-4 w-4" /> },
      { label: 'Approvals', path: '/approvals', icon: <CheckCircle2 className="h-4 w-4" /> },
      { label: 'Usage & Costs', path: '/usage', icon: <DollarSign className="h-4 w-4" /> },
    ],
  },
  {
    title: 'SETTINGS',
    key: 'settings',
    items: [
      { label: 'Configuration', path: '/settings', icon: <Settings className="h-4 w-4" /> },
      { label: 'Integrations', path: '/settings/integrations', icon: <Plug className="h-4 w-4" /> },
      { label: 'Logs', path: '/settings/logs', icon: <FileText className="h-4 w-4" /> },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, sidebarSections: expandedSections, toggleSidebarSection } = useAppStore();

  return (
    <aside
      className={cn(
        'h-full bg-muted/30 border-r flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {sidebarSections.map((section) => (
          <div key={section.key} className="mb-4">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSidebarSection(section.key)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    expandedSections[section.key] ? '' : '-rotate-90'
                  )}
                />
              </button>
            )}
            
            <div
              className={cn(
                'space-y-1 px-2',
                !expandedSections[section.key] && !sidebarCollapsed ? 'hidden' : ''
              )}
            >
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      sidebarCollapsed && 'justify-center'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full h-8"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
