import Project from "../models/project.js";
import Workspace from "../models/workspace.js";
import { checkPlagiarism, generateBenchmarks } from "../libs/gemini.js";

/**
 * POST /:projectId/review
 * Faculty manually triggers AI review for a specific project request.
 * Accepts { plagiarismThreshold } in request body (default: 70).
 */
const triggerAIReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { plagiarismThreshold = 70 } = req.body;

    // Only faculty/admin can trigger AI reviews
    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only faculty members can trigger AI reviews",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify the faculty is a member of the workspace
    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // Get all approved projects in the same workspace for plagiarism comparison
    const existingProjects = await Project.find({
      workspace: project.workspace,
      isApproved: true,
      _id: { $ne: projectId },
    }).select("_id title description");

    // Run AI analysis
    const [plagiarismResult, benchmarkResult] = await Promise.all([
      checkPlagiarism(project, existingProjects),
      generateBenchmarks(project.title, project.description),
    ]);

    const threshold = Math.max(0, Math.min(100, Number(plagiarismThreshold)));
    let status = "approved";

    if (plagiarismResult.plagiarismScore >= threshold) {
      status = "plagiarism_detected";
    } else if (!benchmarkResult.meetsStandard) {
      status = "below_benchmark";
    } else if (plagiarismResult.plagiarismScore >= 40) {
      status = "needs_review";
    }

    // Save results
    project.aiReview = {
      status,
      plagiarismScore: plagiarismResult.plagiarismScore || 0,
      plagiarismThreshold: threshold,
      similarProjects: (plagiarismResult.similarProjects || []).map(sp => ({
        projectId: sp.projectId || undefined,
        projectTitle: sp.projectTitle,
        similarityScore: sp.similarityScore,
        reasoning: sp.reasoning,
      })),
      benchmarks: (benchmarkResult.benchmarks || []).map(b => ({
        category: b.category,
        description: b.description,
        met: false,
      })),
      reviewComment: benchmarkResult.reviewComment || "",
      benchmarkSummary: benchmarkResult.benchmarkSummary || "",
      reviewedAt: new Date(),
    };

    await project.save();

    return res.status(200).json({
      message: "AI review completed successfully",
      aiReview: project.aiReview,
    });
  } catch (error) {
    console.error("AI Review Error:", error);
    return res.status(500).json({ message: error.message || "Failed to complete AI review" });
  }
};

/**
 * GET /:projectId/review
 */
const getAIReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).select("aiReview");
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(200).json({ aiReview: project.aiReview || { status: "pending" } });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /:workspaceId/bulk-filter
 */
const bulkAIFilter = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (req.user.role !== "faculty" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Filter projects
    const flaggedProjects = await Project.find({
      workspace: workspaceId,
      isApproved: false,
      "aiReview.status": { $in: ["plagiarism_detected", "below_benchmark"] },
    });

    if (flaggedProjects.length === 0) {
      return res.status(200).json({ message: "No flagged projects", rejectedCount: 0 });
    }

    const ids = flaggedProjects.map(p => p._id);
    workspace.projects = workspace.projects.filter(pid => !ids.some(id => id.toString() === pid.toString()));
    await workspace.save();
    await Project.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({ message: `Success. ${ids.length} projects rejected.`, rejectedCount: ids.length });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { triggerAIReview, getAIReview, bulkAIFilter };
