import React, { useEffect, useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { Button, Card, CardContent, Badge, Progress } from '@/components/ui';
import { useProjectsStore } from '@/stores';
import { projectsApi } from '@/services/api';
import { formatTimeAgo } from '@/utils';

const Projects: React.FC = () => {
  const { projects, setProjects } = useProjectsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [setProjects]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{project.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {project.techStack.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{project.agentCount} agents</span>
                <span>{formatTimeAgo(project.lastActivity)}</span>
              </div>
              <Progress value={project.progress} className="h-1 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
