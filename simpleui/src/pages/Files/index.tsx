import React from 'react';
import { FileBox, Folder, File, Download, Upload } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

const Files: React.FC = () => {
  return (
    <div className="p-6 h-full flex">
      <div className="w-64 border-r pr-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Files</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon"><Upload className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
            <Folder className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">src</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer pl-6">
            <File className="h-4 w-4 text-blue-500" />
            <span className="text-sm">index.tsx</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer pl-6">
            <File className="h-4 w-4 text-blue-500" />
            <span className="text-sm">App.tsx</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
            <File className="h-4 w-4 text-green-500" />
            <span className="text-sm">package.json</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 pl-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">File Browser</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Request Agent Edit</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
          </div>
        </div>
        
        <Card className="h-[calc(100%-60px)]">
          <CardContent className="p-4 h-full">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a file to view its contents
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Files;
