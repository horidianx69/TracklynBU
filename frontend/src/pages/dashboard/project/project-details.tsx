import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import type { Project, Task, TaskStatus } from "@/types";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TaskColumn } from "./components/TaskColumn";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { TaskCard } from "./components/TaskCard";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate } = useUpdateTaskStatusMutation();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure drag activation - requires 8px movement before drag starts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Must drag 8 pixels before drag activates
      },
    })
  );

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    };
    isLoading: boolean;
  };

  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  const { user } = useAuth();
  const currentUser = project.members.find((member) => member.user._id === user?._id)
  const currentUserRole = currentUser?.role


  const handleTaskClick = (taskId: string) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    // Only allow managers to drag tasks
    if (currentUserRole !== "manager") return;
    
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    // Only allow managers to drop tasks
    if (currentUserRole !== "manager") return;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t._id === taskId);

    if (!task || task.status === newStatus) return;

    const projectIdValue = typeof task.project === "string" ? task.project : task.project._id;
    const queryKey = ["project", projectIdValue];

    // Get previous data for rollback
    const previousData = queryClient.getQueryData(queryKey) as
      | { tasks: Task[]; project: Project }
      | undefined;

    // Optimistic Update
    if (previousData) {
      const updatedTasks = previousData.tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );

      queryClient.setQueryData(queryKey, {
        ...previousData,
        tasks: [...updatedTasks],
      });
    }

    mutate(
      { taskId, status: newStatus, projectId: projectIdValue },
      {
        onSuccess: (updatedTaskFromServer) => {
          toast.success(`Task moved to ${newStatus}`);

          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;

            const updatedTasks = old.tasks.map((t: Task) =>
              t._id === taskId ? { ...t, ...updatedTaskFromServer } : t
            );

            return {
              ...old,
              tasks: [...updatedTasks],
            };
          });
          queryClient.invalidateQueries({ queryKey: queryKey });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to move task");

          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
        },
      }
    );
  };
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">
              {projectProgress}%
            </span>
          </div>

          <Button onClick={() => setIsCreateTask(true)}>Add Task</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>

            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">Status:</span>
              <div>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "To Do").length} To Do
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "In Progress").length}{" "}
                  In Progress
                </Badge>
                <Badge variant="outline" className="bg-background">
                  {tasks.filter((task) => task.status === "Done").length} Done
                </Badge>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="grid grid-cols-3 gap-4">
              <TaskColumn
                title="To Do"
                tasks={tasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
              />

              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
              />

              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
              />
            </div>
          </TabsContent>

          <TabsContent value="todo" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="To Do"
                tasks={tasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="in-progress" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
                isFullWidth
              />
            </div>
          </TabsContent>

          <TabsContent value="done" className="m-0">
            <div className="grid md:grid-cols-1 gap-4">
              <TaskColumn
                title="Done"
                tasks={tasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
                currentUserRole={currentUserRole}
                isFullWidth
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

        {/* create task dialog */}
        <CreateTaskDialog
          open={isCreateTask}
          onOpenChange={setIsCreateTask}
          projectId={projectId!}
          projectMembers={project.members as any}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectDetails;

