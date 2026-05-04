import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button, Card, CardContent, Badge, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import { useTasksStore, useAgentsStore } from '@/stores';
import { tasksApi } from '@/services/api';
import { tasksSocket } from '@/services/socket';
import { cn, formatDuration, getPriorityDot } from '@/utils';
import type { Task, TaskStatus } from '@/types';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'inbox', title: 'Inbox', color: 'border-gray-400' },
  { id: 'assigned', title: 'Assigned', color: 'border-blue-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-yellow-400' },
  { id: 'testing', title: 'Testing', color: 'border-purple-400' },
  { id: 'review', title: 'Review', color: 'border-orange-400' },
  { id: 'done', title: 'Done', color: 'border-green-400' },
];

const Tasks: React.FC = () => {
  const { tasks, setTasks, moveTask, filters, setFilters, setLoading } = useTasksStore();
  const { agents } = useAgentsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    tasksSocket.connect();
    
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasksData = await tasksApi.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [setTasks, setLoading]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    
    moveTask(draggableId, newStatus);
    tasksApi.updateTask(draggableId, { status: newStatus });
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => {
      const matchesStatus = task.status === status;
      const matchesSearch = searchQuery
        ? task.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesAgent = filters.agent === 'all' || task.assignedAgent?.id === filters.agent;
      
      return matchesStatus && matchesSearch && matchesPriority && matchesAgent;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.priority}
            onValueChange={(value: string) => setFilters({ priority: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.agent}
            onValueChange={(value: string) => setFilters({ agent: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-4 h-full min-w-max">
            {columns.map((column) => (
              <div key={column.id} className="w-72 flex flex-col">
                <div className={cn('flex items-center gap-2 pb-2 border-b-2', column.color)}>
                  <span className="font-semibold">{column.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 mt-2 space-y-2 overflow-y-auto rounded-lg p-2 min-h-[200px]',
                        snapshot.isDraggingOver && 'bg-muted'
                      )}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                'cursor-pointer hover:shadow-md transition-shadow',
                                snapshot.isDragging && 'shadow-lg'
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-1">
                                    <span>{getPriorityDot(task.priority)}</span>
                                    <span className="text-xs text-muted-foreground">
                                      #{task.id.slice(0, 6)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm font-medium line-clamp-2 mb-2">
                                  {task.title}
                                </p>
                                {task.assignedAgent && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                    <span>Assigned: {task.assignedAgent.name}</span>
                                  </div>
                                )}
                                {task.timeElapsed && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {formatDuration(task.timeElapsed)}
                                  </div>
                                )}
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Tasks;
