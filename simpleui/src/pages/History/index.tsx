import React from 'react';
import { History, RotateCcw, Eye } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { formatTimeAgo } from '@/utils';

const HistoryPage: React.FC = () => {
  const snapshots = [
    { id: '1', agent: 'Frontend Agent', description: 'Added login form', files: ['Login.tsx', 'styles.css'], time: new Date().toISOString() },
    { id: '2', agent: 'Backend Agent', description: 'Created API endpoints', files: ['api.ts'], time: new Date(Date.now() - 3600000).toISOString() },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Version History</h1>
      
      <div className="space-y-4">
        {snapshots.map((snapshot) => (
          <Card key={snapshot.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{snapshot.agent}</span>
                    <span className="text-muted-foreground">{formatTimeAgo(snapshot.time)}</span>
                  </div>
                  <p className="text-sm mb-2">{snapshot.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Files: {snapshot.files.join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> View</Button>
                  <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-1" /> Restore</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
