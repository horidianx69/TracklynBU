import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUpdateTaskStatusMutation, useUpdateTaskMarksMutation, useUpdateTaskScoreMutation } from "@/hooks/use-task";
import type { Project, Task } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
  // console.log("Task:", task);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateTaskStatusMutation();
  const { mutate: updateMarks } = useUpdateTaskMarksMutation();
  const { mutate: updateScore } = useUpdateTaskScoreMutation();
  const [marks, setMarks] = useState<string>(String(task.marks ?? 0));
  const [score, setScore] = useState<string>(String(task.score ?? 0));

  const handleMarksChange = (newMarks: string) => {
    console.log("Handling marks change:", newMarks);
    
    if (newMarks === "") {
      setMarks("");
      return;
    }
    const numericOnly = newMarks.replace(/[^0-9]/g, "");
    const withoutLeadingZeros = numericOnly.replace(/^0+/, "") || "0";
    const numValue = Number(withoutLeadingZeros);
    if (numValue > 100) {
      toast.error("Maximum marks is 100");
      return;
    }
    setMarks(withoutLeadingZeros);
    
    console.log("Marks updated:", {
      taskId: task._id,
      taskTitle: task.title,
      newMarks: withoutLeadingZeros,
      oldMarks: marks,
      numericValue: numValue
    });
  };

  const handleMarksBlur = () => {
    if (marks === "") {
      setMarks("0");
    }
    
    const numericMarks = Number(marks || "0");
    const projectId = typeof task.project === "string" ? task.project : task.project._id;
    
    // Only save if marks changed
    if (numericMarks !== (task.marks ?? 0)) {
      console.log("Saving marks to backend:", numericMarks);
      
      const queryKey = ["project", projectId];
      
      // get previous data for rollback
      const previousData = queryClient.getQueryData(queryKey) as
        | { tasks: Task[]; project: Project }
        | undefined;

      // optimistic Update i.e update cache immediately
      if (previousData) {
        const updatedTasks = previousData.tasks.map((t) =>
          t._id === task._id ? { ...t, marks: numericMarks } : t
        );

        queryClient.setQueryData(queryKey, {
          ...previousData,
          tasks: [...updatedTasks],
        });
      }
      
      updateMarks(
        { 
          taskId: task._id, 
          marks: numericMarks,
          projectId 
        },
        {
          onSuccess: (updatedTaskFromServer) => {
            toast.success(`Marks updated to ${numericMarks}`);
            
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
            toast.error(error?.response?.data?.message || "Failed to update marks");
            
            // Rollback to original value in local state
            setMarks(String(task.marks ?? 0));
            
            // Rollback cache to previous data
            if (previousData) {
              queryClient.setQueryData(queryKey, previousData);
            }
          },
        }
      );
    }
  };

  const handleScoreChange = (newScore: string) => {
    console.log("Handling score change:", newScore);
    
    if (newScore === "") {
      setScore("");
      return;
    }
    const numericOnly = newScore.replace(/[^0-9]/g, "");
    const withoutLeadingZeros = numericOnly.replace(/^0+/, "") || "0";
    const numValue = Number(withoutLeadingZeros);
    
    const totalMarks = task.marks ?? 0;
    if (numValue > totalMarks) {
      toast.error(`Score cannot exceed total marks (${totalMarks})`);
      return;
    }
    
    setScore(withoutLeadingZeros);
    
    console.log("Score updated:", {
      taskId: task._id,
      taskTitle: task.title,
      newScore: withoutLeadingZeros,
      oldScore: score,
      numericValue: numValue
    });
  };

  const handleScoreBlur = () => {
    if (score === "") {
      setScore("0");
    }
    
    const numericScore = Number(score || "0");
    const projectId = typeof task.project === "string" ? task.project : task.project._id;
    
    // only save if score changed
    if (numericScore !== (task.score ?? 0)) {
      console.log("Saving score to backend:", numericScore);
      
      const queryKey = ["project", projectId];
      
      // get previous data for rollback
      const previousData = queryClient.getQueryData(queryKey) as
        | { tasks: Task[]; project: Project }
        | undefined;

      // optimistic Update i.e update cache immediately
      if (previousData) {
        const updatedTasks = previousData.tasks.map((t) =>
          t._id === task._id ? { ...t, score: numericScore } : t
        );

        queryClient.setQueryData(queryKey, {
          ...previousData,
          tasks: [...updatedTasks],
        });
      }
      
      updateScore(
        { 
          taskId: task._id, 
          score: numericScore,
          projectId 
        },
        {
          onSuccess: (updatedTaskFromServer) => {
            toast.success(`Score updated to ${numericScore}`);
            
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
            toast.error(error?.response?.data?.message || "Failed to update score");
            
            // Rollback to original value in local state
            setScore(String(task.score ?? 0));
            
            // Rollback cache to previous data
            if (previousData) {
              queryClient.setQueryData(queryKey, previousData);
            }
          },
        }
      );
    }
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStatusChange = (newStatus: "To Do" | "In Progress" | "Done") => {
    console.log("Changing status to:", newStatus);
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onClick();
      }}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 gap-2 py-4"
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

      <CardContent className="">
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
                    {member.name ? <AvatarFallback>{member.name.charAt(0)}</AvatarFallback> : null}
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

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">Click to Edit</div>
          {/* later add logic so this is only editable by owner of the workspace */}
          <div className="flex items-center gap-2">
            {task.status === "Done" ? (
              <>
                {/* Score input when task is done */}
                <input
                  type="number"
                  value={score}
                  onChange={(e) => {
                    handleScoreChange(e.target.value)
                  }}
                  onBlur={handleScoreBlur}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  min="0"
                  max={task.marks ?? 0}
                  className="w-16 px-2 py-1 bg-background border border-green-500/50 hover:border-green-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded text-sm font-bold text-green-400 text-center transition-colors outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-muted-foreground">: out of <span className="text-md text-foreground font-bold">{task.marks ?? 0}</span></span>
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">Total marks:</span>
                {/* Total marks input when task is not done */}
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => {
                    handleMarksChange(e.target.value)
                  }}
                  onBlur={handleMarksBlur}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-16 px-2 py-1 bg-background border border-blue-500/50 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded text-sm font-bold text-blue-400 text-center transition-colors outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
