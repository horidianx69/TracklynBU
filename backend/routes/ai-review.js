import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js";
import {
  triggerAIReview,
  getAIReview,
  bulkAIFilter,
} from "../controllers/ai-review.js";

const router = express.Router();

// Trigger AI review for a specific project (faculty only)
router.post(
  "/:projectId/review",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
    body: z.object({
      plagiarismThreshold: z.number().min(0).max(100).optional().default(70),
    }),
  }),
  triggerAIReview
);

// Get AI review data for a project
router.get(
  "/:projectId/review",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  getAIReview
);

// Bulk filter flagged projects in a workspace (faculty only)
router.post(
  "/:workspaceId/bulk-filter",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
  }),
  bulkAIFilter
);

export default router;
