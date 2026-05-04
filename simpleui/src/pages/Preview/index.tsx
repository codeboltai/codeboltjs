import React from 'react';
import { Eye, Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { cn } from '@/utils';

const Preview: React.FC = () => {
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Preview</h1>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={device === 'desktop' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><ExternalLink className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center bg-muted">
          <div className={cn(
            'bg-background border rounded-lg shadow-lg overflow-hidden',
            device === 'desktop' && 'w-full h-full',
            device === 'tablet' && 'w-[768px] h-[1024px]',
            device === 'mobile' && 'w-[375px] h-[667px]'
          )}>
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Preview will appear here
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Preview;
