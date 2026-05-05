import React from 'react';
import { Plus, Rocket } from 'lucide-react';
import { Button, Card, CardContent, Badge, Progress } from '@/components/ui';

const Missions: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Missions</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Mission
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Sample Mission</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Create a sample mission to demonstrate the feature
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress</span>
              <span className="text-sm text-muted-foreground">0/5 tasks</span>
            </div>
            <Progress value={0} className="h-2" />
            <Badge variant="secondary" className="mt-3">Planning</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Missions;
