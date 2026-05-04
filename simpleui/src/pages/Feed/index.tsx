import React from 'react';
import { Activity, Filter } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatTimeAgo } from '@/utils';
import { cn } from '@/utils';

const Feed: React.FC = () => {
  const events = [
    { id: '1', type: 'tool', agent: 'Frontend Agent', description: 'Used file_write tool', time: new Date().toISOString() },
    { id: '2', type: 'user', description: 'Sent message: "Create login page"', time: new Date(Date.now() - 60000).toISOString() },
    { id: '3', type: 'agent', agent: 'Frontend Agent', description: 'Task completed: Build login form', time: new Date(Date.now() - 120000).toISOString() },
    { id: '4', type: 'error', agent: 'Backend Agent', description: 'Failed to connect to database', time: new Date(Date.now() - 300000).toISOString() },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tool: 'bg-blue-500',
      user: 'bg-green-500',
      agent: 'bg-purple-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Live Feed</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Filter</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
          >
            <div className={cn('w-2 h-2 rounded-full mt-2', getTypeColor(event.type))} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {event.agent && <span className="font-medium text-sm">{event.agent}</span>}
                <span className="text-xs text-muted-foreground">{formatTimeAgo(event.time)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
            <Badge variant="outline" className="text-xs capitalize">{event.type}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
