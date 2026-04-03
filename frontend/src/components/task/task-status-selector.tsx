import type { TaskStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";

export const TaskStatusSelector = ({
  status,
  taskId,
  projectId,
  isEvaluated,
}: {
  status: TaskStatus;
  taskId: string;
  projectId: string;
  isEvaluated: boolean;
}) => {
  const { user } = useAuth();
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  const isDisabled = isPending || (isEvaluated && user?.role === "student");

  const handleStatusChange = (value: string) => {
    mutate(
      { taskId, status: value as TaskStatus, projectId },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response.data.message;
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };
  return (
    <Select value={status || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]" disabled={isDisabled}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};
