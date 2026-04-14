import { useApproveFacultyMutation, useGetPendingFacultyQuery, useRejectFacultyMutation } from "@/hooks/use-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/loader";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function FacultyRequests() {
  const { data: pendingFaculty, isLoading } = useGetPendingFacultyQuery();
  const { mutate: approveFaculty, isPending: isApproving } = useApproveFacultyMutation();
  const { mutate: rejectFaculty, isPending: isRejecting } = useRejectFacultyMutation();

  const handleApprove = (userId: string) => {
    approveFaculty(userId, {
      onSuccess: () => toast.success("Faculty approved successfully"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to approve faculty"),
    });
  };

  const handleReject = (userId: string) => {
    if (!confirm("Are you sure you want to reject and delete this account?")) return;
    rejectFaculty(userId, {
      onSuccess: () => toast.success("Faculty rejected and deleted"),
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed to reject faculty"),
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Faculty Requests</h1>
        <Badge variant="outline">{pendingFaculty?.length || 0} Pending</Badge>
      </div>

      <div className="grid gap-4">
        {pendingFaculty?.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No pending faculty requests at the moment.
            </CardContent>
          </Card>
        ) : (
          pendingFaculty?.map((faculty: any) => (
            <Card key={faculty._id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{faculty.name}</CardTitle>
                <Badge variant="secondary">Faculty</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{faculty.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(faculty.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleApprove(faculty._id)}
                      disabled={isApproving || isRejecting}
                    >
                      <CheckCircle className="size-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleReject(faculty._id)}
                      disabled={isApproving || isRejecting}
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
