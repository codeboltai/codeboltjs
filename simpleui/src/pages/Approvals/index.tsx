import React from 'react';
import { CheckCircle2, X, AlertTriangle, Eye } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatTimeAgo } from '@/utils';

const Approvals: React.FC = () => {
  const approvals = [
    { id: '1', agent: 'Frontend Agent', description: 'Deploy to production', category: 'deploy', risk: 'medium', time: new Date().toISOString() },
    { id: '2', agent: 'Backend Agent', description: 'Delete old log files', category: 'delete', risk: 'high', time: new Date(Date.now() - 60000).toISOString() },
  ];

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-red-500',
    };
    return colors[risk] || 'text-gray-500';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Approvals</h1>
      
      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${getRiskColor(approval.risk)}`} />
                    <span className="font-medium">{approval.agent}</span>
                    <Badge variant="outline" className="capitalize">{approval.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(approval.time)}</span>
                  </div>
                  <p className="text-sm">{approval.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm"><X className="h-4 w-4" /></Button>
                  <Button size="sm"><CheckCircle2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Approvals;
