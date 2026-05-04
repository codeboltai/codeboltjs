import React from 'react';
import { Plus, Clock, Play } from 'lucide-react';
import { Button, Card, CardContent, Badge, Switch } from '@/components/ui';

const Schedules: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">Automate recurring tasks — agents run them on your behalf</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Daily Sales Report</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Play className="h-4 w-4" /></Button>
                <Switch checked={true} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Schedule:</span>
                <span className="ml-2">Every day at 9:00 AM</span>
              </div>
              <div>
                <span className="text-muted-foreground">Agent:</span>
                <span className="ml-2">Main Agent</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last run:</span>
                <span className="ml-2">Today 9:00 AM</span>
              </div>
              <div>
                <span className="text-muted-foreground">Next run:</span>
                <span className="ml-2">Tomorrow 9:00 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedules;
