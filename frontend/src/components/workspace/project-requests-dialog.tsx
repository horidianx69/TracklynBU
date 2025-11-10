import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface ProjectRequestsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const ProjectRequestsDialog = ({
  isOpen,
  onOpenChange,
  workspaceId,
}: ProjectRequestsDialogProps) => {
  // TODO: Add project requests data here
  const projectRequests: any[] = [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Requests</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {projectRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No project requests at the moment</p>
            </div>
          ) : (
            projectRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <CardTitle className="text-base">{request.projectName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Requested by: {request.requestedBy}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Description: {request.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
