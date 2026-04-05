import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";

// Helper for Phase 3: Check if the user is allowed to edit a potentially evaluated task
const canEditTask = (task, userRole) => {
  if (!task.isEvaluated) return true;
  return userRole === "faculty" || userRole === "admin";
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      project: projectId,
      createdBy: req.user._id,
    });

    project.tasks.push(newTask._id);
    await project.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignees", "name profilePicture")
      .populate("watchers", "name profilePicture");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project).populate(
      "members.user",
      "name profilePicture"
    );

    res.status(200).json({ task, project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const oldTitle = task.title;

    task.title = title;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");

    task.description = description;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    // Phase 3: Additional guard just in case - even if faculty, warn if moving evaluated task from Done?
    // The requirement only says role-based task edit permissions. The `canEditTask` covers students.
    const oldStatus = task.status;

    task.status = status;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    task.assignees = assignees;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task assignees`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const oldPriority = task.priority;

    task.priority = priority;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const newSubTask = {
      title,
      completed: false,
    };

    task.subtasks.push(newSubTask);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const subTask = task.subtasks.id(subTaskId);

    if (!subTask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }

    subTask.completed = completed;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const activity = await ActivityLog.find({ resourceId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    // Phase 3.5: Access control check for activity feed
    // If the resource is a task, verify project membership
    const task = await Task.findById(resourceId);
    if (task) {
      const project = await Project.findById(task.project);
      if (project) {
        const isMember = project.members.some(
          (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    } else {
      // If the resource is a workspace, verify workspace membership
      const workspace = await Workspace.findById(resourceId);
      if (workspace) {
        const isMember = workspace.members.some(
          (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Phase 3.5: Access control check for reading comments
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const newComment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
    });

    task.comments.push(newComment._id);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "added_comment", "Task", taskId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const isWatching = task.watchers.includes(req.user._id);

    if (!isWatching) {
      task.watchers.push(req.user._id);
    } else {
      task.watchers = task.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${
        isWatching ? "stopped watching" : "started watching"
      } task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!canEditTask(task, req.user.role)) {
      return res.status(403).json({
        message: "This task has been evaluated and is locked for students",
      });
    }

    const isAchieved = task.isArchived;

    task.isArchived = !isAchieved;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${isAchieved ? "unachieved" : "achieved"} task ${
        task.title
      }`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
      .populate("project", "title workspace")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskMarks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { marks } = req.body;

    // Validate marks
    if (typeof marks !== "number" || marks < 0 || marks > 100) {
      return res.status(400).json({
        message: "Marks must be a number between 0 and 100",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Only faculty/admin can set marks
    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only faculty members can assign marks",
      });
    }

    // Task must be in Done status
    if (task.status !== "Done") {
      return res.status(400).json({
        message: "Marks can only be given when the task is in 'Done' status.",
      });
    }

    const oldMarks = task.marks || 0;

    task.marks = marks;
    task.isEvaluated = true;
    await task.save();

    // Check if all tasks in the project are now evaluated
    const updatedProjectTasks = await Task.find({ project: project._id, isArchived: false });
    const allGraded = updatedProjectTasks.length > 0 && updatedProjectTasks.every((t) => t.isEvaluated);

    if (allGraded) {
      const scoresMap = {};
      updatedProjectTasks.forEach((t) => {
        t.assignees.forEach((studentId) => {
          const sid = studentId.toString();
          if (!scoresMap[sid]) scoresMap[sid] = 0;
          scoresMap[sid] += t.marks || 0;
        });
      });

      const studentScores = Object.keys(scoresMap).map((sid) => ({
        student: sid,
        totalMarks: scoresMap[sid],
      }));

      project.studentScores = studentScores;
      project.isFullyGraded = true;
      await project.save();
    }

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `graded task: ${marks} marks`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Only faculty/admin can delete tasks
    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only faculty members can delete tasks",
      });
    }

    // Remove task from project tasks array
    project.tasks = project.tasks.filter((tId) => tId.toString() !== taskId.toString());
    await project.save();

    await Task.findByIdAndDelete(taskId);

    // Record activity on the project since the task is gone
    await recordActivity(req.user._id, "deleted_task", "Project", project._id, {
      description: `deleted task: ${task.title}`,
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

import { smartGrade } from "../libs/gemini.js";

const smartGradeProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Verify access
    const project = await Project.findById(projectId).populate("members.user");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only faculty can trigger smart grading" });
    }

    // 2. Fetch ungraded, "Done" tasks
    const tasks = await Task.find({
      project: projectId,
      status: "Done",
      isEvaluated: false,
    }).populate("assignees", "name email");

    if (tasks.length === 0) {
      return res.status(400).json({ message: "No ungraded 'Done' tasks found for this project." });
    }

    // 3. Group tasks by student
    const groupedData = {};
    for (const task of tasks) {
      for (const assignee of task.assignees) {
        if (!groupedData[assignee._id]) {
          groupedData[assignee._id] = {
            studentName: assignee.name,
            tasks: [],
          };
        }
        
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        
        groupedData[assignee._id].tasks.push({
          taskId: task._id,
          title: task.title,
          description: task.description || "",
          subtasksTotal: task.subtasks.length,
          subtasksCompleted: completedSubtasks,
          taskTags: task.tags || [],
        });
      }
    }

    // 4. Send to Gemini
    const aiResults = await smartGrade(project.gradingRubric, groupedData, project.title);

    // 5. Merge AI results with task basic info so frontend has everything
    const enrichedResults = aiResults.map(aiEval => {
      const dbTask = tasks.find(t => t._id.toString() === aiEval.taskId);
      return {
        ...aiEval,
        taskTitle: dbTask?.title,
        assigneeNames: dbTask?.assignees.map(a => a.name).join(", "),
      };
    }).filter(r => r.taskTitle); // Ensure we only return valid task ids

    res.status(200).json({ evaluations: enrichedResults });

  } catch (error) {
    console.error("Smart Grade Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate AI grades" });
  }
};

const applySmartGrade = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { evaluations } = req.body; // Array of { taskId, marks }

    if (!Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Invalid evaluations format" });
    }

    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only faculty can apply grades" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update all tasks
    const operations = evaluations.map(ev => ({
      updateOne: {
        filter: { _id: ev.taskId, project: projectId },
        update: { $set: { marks: ev.marks, isEvaluated: true } }
      }
    }));

    if (operations.length > 0) {
      await Task.bulkWrite(operations);
    }

    // Now recalculate project totals 
    // Wait for all updates
    const allEvaluatedTasks = await Task.find({ project: projectId, isEvaluated: true, marks: { $exists: true } });
    
    const scoresMap = {};
    for (const task of allEvaluatedTasks) {
       for (const assignee of task.assignees) {
         if (!scoresMap[assignee.toString()]) scoresMap[assignee.toString()] = 0;
         scoresMap[assignee.toString()] += task.marks;
       }
    }

    const newStudentScores = Object.keys(scoresMap).map(studentId => ({
      student: studentId,
      totalMarks: scoresMap[studentId]
    }));

    project.studentScores = newStudentScores;
    
    // Check if fully graded
    const allTasks = await Task.find({ project: projectId });
    const allScored = allTasks.length > 0 && allTasks.every(t => t.isEvaluated);
    project.isFullyGraded = allScored;

    await project.save();

    res.status(200).json({ message: "Grades applied successfully" });

  } catch (error) {
    console.error("Apply Smart Grade Error:", error);
    res.status(500).json({ message: "Internal server error applying grades" });
  }
};

export {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
  updateTaskMarks,
  deleteTask,
  smartGradeProject,
  applySmartGrade,
};
