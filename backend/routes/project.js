import express from "express";
import authMiddleware from "../middleware/auth-middleware.js";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validate-schema.js";
import { z } from "zod";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
  approveProject,
  rejectProject,
  updateProjectRubric,
} from "../controllers/project.js";

const router = express.Router();

router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({
      workspaceId: z.string(),
    }),
    body: projectSchema,
  }),
  createProject
);

router.get(
  "/:projectId",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getProjectDetails
);

router.get(
  "/:projectId/tasks",
  authMiddleware,
  validateRequest({ params: z.object({ projectId: z.string() }) }),
  getProjectTasks
);

router.put(
  "/:projectId/approve",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  approveProject
);

router.delete(
  "/:projectId/reject",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  rejectProject
);

router.put(
  "/:projectId/rubric",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
    body: z.object({ gradingRubric: z.string() }),
  }),
  updateProjectRubric
);

export default router;
