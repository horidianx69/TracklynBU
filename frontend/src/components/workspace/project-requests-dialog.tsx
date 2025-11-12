import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { Project, User } from "@/types";
import { useApproveProjectMutation, useRejectProjectMutation } from "@/hooks/use-project";
import { toast } from "sonner";

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
  members
}: ProjectRequestsDialogProps) => {
  
  // These hooks give us the `mutate` function and `isPending` state
  const { mutate: approveProject, isPending: isApproving } = useApproveProjectMutation();
  const { mutate: rejectProject, isPending: isRejecting } = useRejectProjectMutation();
  
  const handleApprove = (projectId: string) => {
    // Call the mutate function with the data it needs
    approveProject(
      { 
        projectId,
        workspaceId 
      },
      {
        // onSuccess: This callback runs after successful API call
        onSuccess: () => {
          toast.success("Project approved successfully");
        },
        // onError: This callback runs if the API call fails
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to approve project");
        },
      }
    );
  };

  const handleReject = (projectId: string) => {
    rejectProject(
      { 
        projectId,
        workspaceId 
      },
      {
        onSuccess: () => {
          toast.success("Project rejected and deleted");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to reject project");
        },
      }
    );
  };
  
  const projectRequests = projects.filter((project) => !project.isApproved)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Requests</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-scroll [&::-webkit-scrollbar]:hidden 
                [-ms-overflow-style:none] 
                [scrollbar-width:none]">
          {projectRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No project requests at the moment</p>
            </div>
          ) : (
            projectRequests.map((request) => {
              const creatorUserId = request.members[1]?.user;
              const requestedBy = members.find((member) => member.user._id === creatorUserId);
              
              return(
              <Card key={request._id} >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg font-semibold">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by <span className="font-medium text-foreground">{requestedBy?.user.name || "Unknown"}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleApprove(request._id)}
                        disabled={isApproving || isRejecting}
                      >
                      <CheckCircle className="w-4 h-4" />
                        {isApproving ? "Approving..." : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                        onClick={() => handleReject(request._id)}
                        disabled={isApproving || isRejecting}
                      >
                      <XCircle className="w-4 h-4" />
                        {isRejecting ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {request.description && (
                  <CardContent className="pt-0">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {request.description}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )})
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
