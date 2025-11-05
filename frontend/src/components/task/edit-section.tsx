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

export default function EditSection({ task, project }: { task: Task, project: Project }) {
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
          <TaskStatusSelector status={task.status} taskId={task._id} />

          <Button
            variant={"destructive"}
            size="sm"
            onClick={() => {}}
            className="hidden md:block"
          >
            Delete Task
          </Button>
        </div>
      </div>
      <div className='flex justify-between p-6 border-b'>
        <TaskTitle title={task.title} taskId={task._id} />

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
        <TaskPrioritySelector priority={task.priority} taskId={task._id} />
      </div>

      {/* Sub Tasks Section */}
      <div className="p-6">
        <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} />
      </div>
    </div>
  )
}
