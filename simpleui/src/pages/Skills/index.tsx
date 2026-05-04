import React from 'react';
import { Wrench } from 'lucide-react';
import { Card, CardContent, Switch } from '@/components/ui';

const Skills: React.FC = () => {
  const skills = [
    { name: 'File System', description: 'Read and write files', enabled: true },
    { name: 'Shell/Terminal', description: 'Execute shell commands', enabled: true },
    { name: 'Web Browse', description: 'Browse and search the web', enabled: false },
    { name: 'Code Execution', description: 'Run code in sandboxed environment', enabled: true },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Skills & Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{skill.name}</h3>
                </div>
                <Switch checked={skill.enabled} />
              </div>
              <p className="text-sm text-muted-foreground">{skill.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Skills;
