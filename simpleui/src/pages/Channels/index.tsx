import React, { useEffect, useState } from 'react';
import { Plus, Radio, Settings, Link, Unlink } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useChannelsStore } from '@/stores';
import { channelsApi } from '@/services/api';

const Channels: React.FC = () => {
  const { channels, setChannels } = useChannelsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const data = await channelsApi.getChannels();
        setChannels(data);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannels();
  }, [setChannels]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Channels</h1>
          <p className="text-muted-foreground">Connect messaging platforms to your agents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Channel
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold capitalize">{channel.platform}</h3>
                </div>
                <Badge variant={channel.status === 'connected' ? 'success' : 'destructive'}>
                  {channel.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{channel.identifier}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{channel.messageCount} messages today</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  {channel.status === 'connected' ? <Unlink className="h-4 w-4 mr-1" /> : <Link className="h-4 w-4 mr-1" />}
                  {channel.status === 'connected' ? 'Disconnect' : 'Connect'}
                </Button>
                <Button variant="outline" size="sm"><Settings className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Channels;
