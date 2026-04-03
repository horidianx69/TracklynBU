import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import authMiddleware from "../middleware/auth-middleware.js";
import adminMiddleware from "../middleware/admin-middleware.js";
import {
  getPendingFaculty,
  approveFaculty,
  rejectFaculty,
} from "../controllers/admin.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get("/pending-faculty", getPendingFaculty);

router.put(
  "/approve-faculty/:userId",
  validateRequest({
    params: z.object({ userId: z.string() }),
  }),
  approveFaculty
);

router.delete(
  "/reject-faculty/:userId",
  validateRequest({
    params: z.object({ userId: z.string() }),
  }),
  rejectFaculty
);

export default router;
