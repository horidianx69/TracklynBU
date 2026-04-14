import { fetchData, updateData, deleteData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface PendingFaculty {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export const useGetPendingFacultyQuery = () => {
  return useQuery<PendingFaculty[]>({
    queryKey: ["pending-faculty"],
    queryFn: () => fetchData("/admin/pending-faculty"),
  });
};

export const useApproveFacultyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      updateData(`/admin/approve-faculty/${userId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-faculty"],
      });
    },
  });
};

export const useRejectFacultyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      deleteData(`/admin/reject-faculty/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-faculty"],
      });
    },
  });
};
