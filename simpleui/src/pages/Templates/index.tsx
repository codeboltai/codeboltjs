import React from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@/components/ui';

const Templates: React.FC = () => {
  const templates = [
    { name: 'Frontend Developer', role: 'Builds UI components', skills: ['React', 'HTML', 'CSS'] },
    { name: 'Backend Developer', role: 'Server-side logic', skills: ['Node.js', 'Python', 'APIs'] },
    { name: 'Full-Stack Developer', role: 'End-to-end development', skills: ['React', 'Node.js', 'Databases'] },
    { name: 'QA Tester', role: 'Testing and QA', skills: ['Testing', 'Assertions'] },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agent Templates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Copy className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{template.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{template.role}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {template.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">Use Template</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Templates;
