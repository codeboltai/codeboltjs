import React from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatTimeAgo } from '@/utils';

const SquadComms: React.FC = () => {
  const messages = [
    { id: '1', from: 'Frontend Agent', to: 'Backend Agent', type: 'delegation', content: 'Can you create the API endpoints for the login form?', time: new Date().toISOString() },
    { id: '2', from: 'Backend Agent', to: 'Frontend Agent', type: 'approval', content: 'API endpoints are ready. Please integrate.', time: new Date(Date.now() - 60000).toISOString() },
  ];

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      delegation: 'default',
      review_request: 'secondary',
      discussion: 'outline',
      approval: 'default',
      conflict: 'destructive',
    };
    return variants[type] || 'outline';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Squad Comms</h1>
      <p className="text-muted-foreground mb-6">Agent-to-agent communication</p>
      
      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{msg.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{msg.to}</span>
                <Badge variant={getTypeBadge(msg.type)} className="ml-2 capitalize text-xs">{msg.type}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(msg.time)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{msg.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SquadComms;
