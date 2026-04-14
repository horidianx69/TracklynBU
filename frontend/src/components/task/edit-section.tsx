import { Badge } from '../ui/badge'
import { TaskStatusSelector } from './task-status-selector'
import { TaskTitle } from './task-title'
import type { Project, Task } from '@/types'
import { Button } from '../ui/button'
import { TaskDescription } from './task-description'
import { TaskAssigneesSelector } from './task-assignees-selector'
import { TaskPrioritySelector } from './task-priority-selector'
import { SubTasksDetails } from './sub-tasks'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { useAuth } from '@/provider/auth-context'
import { Input } from '../ui/input'
import { useUpdateTaskMarksMutation, useDeleteTaskMutation } from '@/hooks/use-task'
import { toast } from 'sonner'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export default function EditSection({ task, project }: { task: Task, project: Project }) {
  const { user } = useAuth();
  const { mutate: updateMarks, isPending: isMarksPending } = useUpdateTaskMarksMutation();
  const { mutate: deleteTask, isPending: isDeletePending } = useDeleteTaskMutation();
  const navigate = useNavigate();
  
  const [marks, setMarks] = useState(task.marks || 0);

  const handleMarksUpdate = () => {
    updateMarks({ taskId: task._id, marks, projectId: project._id }, {
      onSuccess: () => toast.success("Marks updated successfully"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update marks")
    });
  };

  const handleDeleteTask = () => {
    if (window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
      deleteTask({ taskId: task._id, projectId: project._id }, {
        onSuccess: () => {
          toast.success("Task deleted successfully");
          navigate(-1);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete task")
      });
    }
  };

  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';
  const isEvaluated = task.isEvaluated || false;
  return (
    <div className="bg-card rounded-lg shadow-sm mb-6 border">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-6 border-b">
        <div className="flex-1 space-y-3">
          <Badge
            variant={
              task.priority === "High"
                ? "destructive"
                : task.priority === "Medium"
                ? "default"
                : "outline"
            }
            className="capitalize"
          >
            {task.priority} Priority
          </Badge>

          
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <TaskStatusSelector status={task.status} taskId={task._id} projectId={project._id} isEvaluated={isEvaluated} />

          {isFacultyOrAdmin && (
            <Button
              variant={"destructive"}
              size="sm"
              onClick={handleDeleteTask}
              disabled={isDeletePending}
              className="hidden md:block"
            >
              Delete Task
            </Button>
          )}
        </div>
      </div>
      {/* Title & Created At Section */}
      <div className='flex justify-between p-6 border-b'>
        <TaskTitle title={task.title} taskId={task._id} isEvaluated={isEvaluated} />

        <div className="text-sm text-muted-foreground">
          Created at:{" "}
          {formatDistanceToNow(new Date(task.createdAt), {
            addSuffix: true,
          })}
        </div>
      </div>

      {/* Description Section */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold mb-3">Description</h3>
        <TaskDescription
          description={task.description || ""}
          taskId={task._id}
          isEvaluated={isEvaluated}
        />
      </div>

      {/* Assignees Section */}
      <div className="p-6 border-b">
        <TaskAssigneesSelector
          task={task}
          assignees={task.assignees}
          projectMembers={project.members as any}
        />
      </div>

      {/* Priority Section */}
      <div className="p-6 border-b">
        <h3 className="text-sm font-semibold mb-3">Priority</h3>
        <TaskPrioritySelector priority={task.priority} taskId={task._id} isEvaluated={isEvaluated} />
      </div>

      {/* Grading Section - Faculty Only, visible only when Done */}
      {isFacultyOrAdmin && task.status === 'Done' && (
        <div className="p-6 border-b bg-muted/30">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            Evaluation
            {isEvaluated && <Badge variant="secondary">Graded</Badge>}
          </h3>
          <div className="space-y-2 max-w-sm">
            <label className="text-xs font-medium text-muted-foreground">Marks</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                placeholder="Enter marks"
                className="h-9"
              />
              <Button size="sm" onClick={handleMarksUpdate} disabled={isMarksPending}>
                {isEvaluated ? 'Update' : 'Grade'}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Enter the marks for this task. This will be added to the student's total.</p>
          </div>
        </div>
      )}

      {/* Sub Tasks Section */}
      <div className="p-6">
        <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} isEvaluated={isEvaluated} />
      </div>
    </div>
  )
}
