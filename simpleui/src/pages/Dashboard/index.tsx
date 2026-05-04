import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { useAppStore, useAgentsStore, useTasksStore, useProjectsStore } from '@/stores';
import { tasksApi, agentsApi, projectsApi } from '@/services/api';
import { getGreeting, formatTimeAgo, getStatusColor } from '@/utils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, privacyMode } = useAppStore();
  const { agents, setAgents, getWorkingAgents } = useAgentsStore();
  const { tasks, setTasks, getTaskStats } = useTasksStore();
  const { setProjects, getActiveProjects } = useProjectsStore();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, agentsData, projectsData] = await Promise.all([
          tasksApi.getTasks(),
          agentsApi.getInstalledAgents(),
          projectsApi.getProjects(),
        ]);
        setTasks(tasksData);
        setAgents(agentsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setTasks, setAgents, setProjects]);

  const taskStats = getTaskStats();
  const activeProjects = getActiveProjects();
  const workingAgents = getWorkingAgents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Pending Approvals Banner */}
      {taskStats.awaitingReview > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="font-medium">
              {taskStats.awaitingReview} item{taskStats.awaitingReview > 1 ? 's' : ''} need your approval
            </span>
          </div>
          <Button size="sm" onClick={() => navigate('/approvals')}>
            Review Now
          </Button>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {currentUser?.name || 'User'}
          </h1>
          <p className="text-muted-foreground">Here's what's happening across your projects</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/tasks')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          <Button variant="secondary" onClick={() => navigate('/chat')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with Agent
          </Button>
        </div>
      </div>

      {/* Active Projects Strip */}
      {activeProjects.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {activeProjects.slice(0, 5).map((project) => (
            <Card
              key={project.id}
              className="min-w-[280px] cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold truncate">
                    {privacyMode ? '••••••' : project.name}
                  </h3>
                  <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatTimeAgo(project.lastActivity)}
                </p>
                <Progress value={project.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {project.taskCount} tasks • {project.agentCount} agents
                </p>
              </CardContent>
            </Card>
          ))}
          <Card
            className="min-w-[200px] cursor-pointer hover:shadow-md transition-shadow border-dashed flex items-center justify-center"
            onClick={() => navigate('/projects')}
          >
            <CardContent className="flex flex-col items-center p-4">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-muted-foreground">New Project</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Your Agents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>
              Manage Agents
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No agents configured yet
              </div>
            ) : (
              <div className="space-y-3">
                {agents.slice(0, 5).map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{agent.status === 'working' ? agent.currentTask || 'Working' : 'Idle'}</p>
                      <p className="text-xs text-muted-foreground">{agent.tasksCompleted} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Summary Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Tasks Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              View All Tasks
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{taskStats.awaitingReview}</p>
                <p className="text-xs text-muted-foreground">Review</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{taskStats.completedToday}</p>
                <p className="text-xs text-muted-foreground">Done Today</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{taskStats.blocked}</p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => navigate(`/tasks?task=${task.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                    <span className="text-sm truncate">{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(task.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proactive Suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Suggested Next Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workingAgents.length === 0 && tasks.filter(t => t.status === 'inbox').length > 0 && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm mb-3">You have {tasks.filter(t => t.status === 'inbox').length} unassigned tasks. Want to assign them?</p>
                <Button size="sm" onClick={() => navigate('/tasks')}>Assign Tasks</Button>
              </div>
            )}
            {taskStats.awaitingReview > 0 && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm mb-3">{taskStats.awaitingReview} tasks are waiting for your review</p>
                <Button size="sm" onClick={() => navigate('/approvals')}>Review Now</Button>
              </div>
            )}
            {workingAgents.length > 0 && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm mb-3">{workingAgents.length} agents are actively working</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/feed')}>Watch Live</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
