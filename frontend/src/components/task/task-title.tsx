import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context";

export const TaskTitle = ({
  title,
  taskId,
  isEvaluated,
}: {
  title: string;
  taskId: string;
  isEvaluated: boolean;
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  const isDisabled = isPending || (isEvaluated && user?.role === "student");

  const updateTitle = () => {
    if (isDisabled) return;
    mutate(
      { taskId, title: newTitle },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Title updated successfully");
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
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          className="text-xl! font-semibold w-full min-w-3xl"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <h2 className="text-xl flex-1 font-semibold">{title}</h2>
      )}

      {isEditing ? (
        <Button
          className="py-0"
          size="sm"
          onClick={updateTitle}
          disabled={isPending}
        >
          Save
        </Button>
      ) : (
        !isDisabled && (
          <Edit
            className="size-3 cursor-pointer"
            onClick={() => setIsEditing(true)}
          />
        )
      )}
    </div>
  );
};
