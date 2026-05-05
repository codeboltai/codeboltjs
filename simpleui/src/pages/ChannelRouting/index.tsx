import React from 'react';
import { GitBranch, Plus, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, Badge, Switch } from '@/components/ui';

const ChannelRouting: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Message Routing</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Priority 1</span>
              <Badge>All Channels</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Main Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={true} />
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Default Route</h3>
          <p className="text-sm text-muted-foreground">
            If no rule matches, messages will be sent to: <strong>Main Agent</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelRouting;
