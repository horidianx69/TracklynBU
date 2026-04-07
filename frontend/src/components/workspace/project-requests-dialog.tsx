import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Filter,
  Loader2,
  Wand2,
} from "lucide-react";
import type { Project, User } from "@/types";
import {
  useApproveProjectMutation,
  useRejectProjectMutation,
} from "@/hooks/use-project";
import {
  useTriggerAIReviewMutation,
  useBulkAIFilterMutation,
} from "@/hooks/use-ai-review";
import { toast } from "sonner";
import { AIReviewBadge } from "./ai-review-badge";
import { AIReviewPanel } from "./ai-review-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ProjectRequestsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projects: Project[];
  members: {
    _id: string;
    user: User;
    role: "admin" | "member" | "owner" | "viewer";
    joinedAt: Date;
  }[];
}

export const ProjectRequestsDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
  projects,
  members,
}: ProjectRequestsDialogProps) => {
  const [plagiarismThreshold, setPlagiarismThreshold] = useState(70);
  const [reviewingProjectId, setReviewingProjectId] = useState<string | null>(null);
  const [showBulkFilterConfirm, setShowBulkFilterConfirm] = useState(false);

  const { mutate: approveProject, isPending: isApproving } = useApproveProjectMutation();
  const { mutate: rejectProject, isPending: isRejecting } = useRejectProjectMutation();
  const { mutate: triggerAIReview, isPending: isReviewing } = useTriggerAIReviewMutation();
  const { mutate: bulkFilter, isPending: isBulkFiltering } = useBulkAIFilterMutation();

  const projectRequests = projects.filter((project) => !project.isApproved);
  const flaggedCount = projectRequests.filter(
    (p) => p.aiReview?.status === "plagiarism_detected" || p.aiReview?.status === "below_benchmark"
  ).length;

  const handleApprove = (projectId: string) => {
    approveProject({ projectId, workspaceId }, {
      onSuccess: () => toast.success("Project approved successfully"),
      onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to approve project"),
    });
  };

  const handleReject = (projectId: string) => {
    rejectProject({ projectId, workspaceId }, {
      onSuccess: () => toast.success("Project rejected and deleted"),
      onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to reject project"),
    });
  };

  const handleAIReview = (projectId: string) => {
    setReviewingProjectId(projectId);
    triggerAIReview({ projectId, plagiarismThreshold }, {
      onSuccess: () => {
        toast.success("AI review completed");
        setReviewingProjectId(null);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "AI review failed");
        setReviewingProjectId(null);
      },
    });
  };

  const handleBulkFilter = () => {
    bulkFilter({ workspaceId }, {
      onSuccess: (data: any) => {
        toast.success(data?.message || "Flagged projects filtered successfully");
        setShowBulkFilterConfirm(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Bulk filter failed");
        setShowBulkFilterConfirm(false);
      },
    });
  };

  const getCardBorderClass = (project: Project) => {
    if (!project.aiReview) return "";
    switch (project.aiReview.status) {
      case "plagiarism_detected": return "border-l-4 border-l-red-500";
      case "below_benchmark": return "border-l-4 border-l-purple-500";
      case "needs_review": return "border-l-4 border-l-amber-500";
      case "approved": return "border-l-4 border-l-emerald-500";
      default: return "";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader className="pb-0">
            <DialogTitle className="flex items-center gap-2">
              Project Requests {projectRequests.length > 0 && <span className="text-sm font-normal text-muted-foreground">({projectRequests.length})</span>}
            </DialogTitle>
          </DialogHeader>

          {projectRequests.length > 0 && (
            <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200/60 dark:border-violet-800/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold text-violet-800 dark:text-violet-200">AI Review Controls</span>
                </div>
                {flaggedCount > 0 && (
                  <Button size="sm" variant="destructive" className="gap-1.5 text-xs" onClick={() => setShowBulkFilterConfirm(true)} disabled={isBulkFiltering}>
                    {isBulkFiltering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
                    AI Auto-Filter ({flaggedCount})
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-violet-700 dark:text-violet-300 font-medium">Plagiarism Threshold</label>
                  <span className="text-xs font-bold text-violet-800 dark:text-violet-200 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded-full">{plagiarismThreshold}%</span>
                </div>
                <Slider value={[plagiarismThreshold]} onValueChange={(val) => setPlagiarismThreshold(val[0])} min={10} max={100} step={5} className="w-full" />
              </div>
            </div>
          )}

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-hide">
            {projectRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No project requests at the moment</div>
            ) : (
              projectRequests.map((request) => {
                const creatorUserId = request.members[1]?.user;
                const requestedBy = members.find((member) => member.user._id === creatorUserId);
                const isThisReviewing = reviewingProjectId === request._id;

                return (
                  <Card key={request._id} className={`overflow-hidden transition-all duration-200 ${getCardBorderClass(request)} ${request.aiReview?.status === "plagiarism_detected" ? "opacity-75" : ""}`}>
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className={`text-lg font-semibold ${request.aiReview?.status === "plagiarism_detected" ? "line-through text-muted-foreground" : ""}`}>{request.title}</CardTitle>
                        <AIReviewBadge status={request.aiReview?.status || "pending"} plagiarismScore={request.aiReview?.plagiarismScore} />
                      </div>
                      <p className="text-sm text-muted-foreground">by <span className="font-medium text-foreground">{requestedBy?.user.name || "Unknown"}</span></p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="outline" className="gap-1.5 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950" onClick={() => handleAIReview(request._id)} disabled={isThisReviewing || isReviewing}>
                          {isThisReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                          {isThisReviewing ? "Reviewing..." : request.aiReview?.status && request.aiReview.status !== "pending" ? "Re-Review" : "AI Review"}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleApprove(request._id)} disabled={isApproving || isRejecting}><CheckCircle className="w-4 h-4" />Accept</Button>
                        <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => handleReject(request._id)} disabled={isApproving || isRejecting}><XCircle className="w-4 h-4" />Reject</Button>
                      </div>
                    </CardHeader>
                    {request.description && <CardContent className="pt-0 pb-0"><div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">{request.description}</div></CardContent>}
                    {request.aiReview && request.aiReview.status !== "pending" && <AIReviewPanel aiReview={request.aiReview} />}
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBulkFilterConfirm} onOpenChange={setShowBulkFilterConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Filter className="w-5 h-5 text-red-500" />AI Auto-Filter Projects</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will automatically <strong>reject and delete</strong> {flaggedCount} project(s) flagged by AI as plagiarized or below benchmark.</p>
              <p className="text-sm font-medium mt-2">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkFilter} className="bg-red-600 hover:bg-red-700">Reject {flaggedCount} Project(s)</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
