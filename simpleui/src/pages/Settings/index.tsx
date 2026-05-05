import React from 'react';
import { Settings, User, Palette, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Configuration</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="English" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Dark Mode</label>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Provider</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Anthropic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Default Model</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="claude-sonnet-4.5" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-sonnet-4.5">Claude Sonnet 4.5</SelectItem>
                    <SelectItem value="claude-opus-4.5">Claude Opus 4.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
