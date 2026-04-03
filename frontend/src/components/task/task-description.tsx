import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/provider/auth-context";

export const TaskDescription = ({
  description,
  taskId,
  isEvaluated,
}: {
  description: string;
  taskId: string;
  isEvaluated: boolean;
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  const isDisabled = isPending || (isEvaluated && user?.role === "student");

  const updateDescription = () => {
    if (isDisabled) return;
    mutate(
      { taskId, description: newDescription },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Description updated successfully");
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
        <Textarea
          className="w-full min-w-3xl font-light"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={isPending}
        />
      ) : (
        <div className="text-sm md:text-base text-pretty flex-1 text-muted-foreground font-light">
          {description}
        </div>
      )}

      {isEditing ? (
        <Button
          className="py-0"
          size="sm"
          onClick={updateDescription}
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
