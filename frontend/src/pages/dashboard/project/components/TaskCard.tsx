import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import type { Project, Task } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const handleStatusChange = (newStatus: "To Do" | "In Progress" | "Done") => {
    if (!task?._id) return;

    const projectId = typeof task.project === "string" ? task.project : task.project._id;
    const queryKey = ["project", projectId];

    // Get previous data for rollback
    const previousData = queryClient.getQueryData(queryKey) as
      | { tasks: Task[]; project: Project }
      | undefined;

    // Optimistic Update
    if (previousData) {
      const updatedTasks = previousData.tasks.map((t) =>
        t._id === task._id ? { ...t, status: newStatus } : t
      );

      queryClient.setQueryData(queryKey, {
        ...previousData,
        tasks: [...updatedTasks], // new array
      });
    }

    mutate(
      { taskId: task._id, status: newStatus, projectId },
      {
        onSuccess: (updatedTaskFromServer) => {
          toast.success(`Task marked as ${newStatus}`);

          // Update cache with real server data
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old) return old;

            const updatedTasks = old.tasks.map((t: Task) =>
              t._id === task._id
                ? { ...t, ...updatedTaskFromServer } // merge real data
                : t
            );

            return {
              ...old,
              tasks: [...updatedTasks],
            };
          });
          queryClient.invalidateQueries({ queryKey: queryKey });
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to update status");

          // Rollback
          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
        },
      }
    );
  };

  return (
    <Card
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onClick();
      }}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge
            className={
              task.priority === "High"
                ? "bg-red-500 text-white"
                : task.priority === "Medium"
                ? "bg-orange-500 text-white"
                : "bg-slate-500 text-white"
            }
          >
            {task.priority || "Low"}
          </Badge>

          <div className="flex gap-1">
            {task.status !== "To Do" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("To Do");
                }}
                title="Mark as To Do"
              >
                <AlertCircle className="size-4 text-yellow-500" />
              </Button>
            )}

            {task.status !== "In Progress" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("In Progress");
                }}
                title="Mark as In Progress"
              >
                <Clock className="size-4 text-blue-500" />
              </Button>
            )}

            {task.status !== "Done" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange("Done");
                }}
                title="Mark as Done"
              >
                <CheckCircle className="size-4 text-green-600" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h4 className="font-medium mb-2">{task.title}</h4>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 5).map((member) => (
                  <Avatar
                    key={member._id}
                    className="relative size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden"
                    title={member.name}
                  >
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {task.assignees.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.assignees.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="size-3 mr-1" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </div>
          )}
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {task.subtasks.filter((subtask) => subtask.completed).length} /{" "}
            {task.subtasks.length} subtasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};
