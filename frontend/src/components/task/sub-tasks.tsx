import type { Subtask } from "@/types";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useAddSubTaskMutation,
  useUpdateSubTaskMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";

export const SubTasksDetails = ({
  subTasks,
  taskId,
  isEvaluated,
}: {
  subTasks: Subtask[];
  taskId: string;
  isEvaluated: boolean;
}) => {
  const { user } = useAuth();
  const [newSubTask, setNewSubTask] = useState("");
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } =
    useUpdateSubTaskMutation();

  const isDisabled = isPending || isUpdating || (isEvaluated && user?.role === "student");

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    if (isDisabled) return;
    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Sub task updated successfully");
        },
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  const handleAddSubTask = () => {
    if (isDisabled) return;
    addSubTask(
      { taskId, title: newSubTask },
      {
        onSuccess: () => {
          setNewSubTask("");
          toast.success("Sub task added successfully");
        },
        onError: (error: any) => {
          const errMessage = error.response.data.message;
          console.log(error);
          toast.error(errMessage);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 font-bold">
        Sub Tasks
      </h3>

      <div className="space-y-2 mb-4">
        {subTasks.length > 0 ? (
          subTasks.map((subTask) => (
            <div key={subTask._id} className="flex items-center space-x-2">
              <Checkbox
                id={subTask._id}
                checked={subTask.completed}
                onCheckedChange={(checked) =>
                  handleToggleTask(subTask._id, !!checked)
                }
                disabled={isDisabled}
              />

              <label
                className={cn(
                  "text-sm font-light",
                  subTask.completed ? "line-through text-muted-foreground" : ""
                )}
                htmlFor={subTask._id}
              >
                {subTask.title}
              </label>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground font-light">No sub tasks</div>
        )}
      </div>

      <div className="flex ">
        <Input
          placeholder="Add a sub task"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          className="mr-1 h-9 font-light"
          disabled={isDisabled}
        />

        <Button
          onClick={handleAddSubTask}
          disabled={isDisabled || newSubTask.length === 0}
          size="sm"
        >
          Add
        </Button>
      </div>
    </div>
  );
};
