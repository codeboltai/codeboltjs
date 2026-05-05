import React from 'react';
import { Plug, Link, Unlink, Settings } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

const Integrations: React.FC = () => {
  const integrations = [
    { name: 'GitHub', category: 'Version Control', connected: true },
    { name: 'Vercel', category: 'Deployment', connected: false },
    { name: 'Slack', category: 'Communication', connected: true },
    { name: 'Supabase', category: 'Database', connected: false },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{integration.name}</h3>
                </div>
                <Badge variant={integration.connected ? 'success' : 'secondary'}>
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{integration.category}</p>
              <Button variant={integration.connected ? 'outline' : 'default'} size="sm" className="w-full">
                {integration.connected ? (
                  <><Unlink className="h-4 w-4 mr-1" /> Disconnect</>
                ) : (
                  <><Link className="h-4 w-4 mr-1" /> Connect</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
