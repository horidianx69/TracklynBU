import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};

export const useApproveProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: This is the actual API call
    // It takes projectId and workspaceId as parameters
    mutationFn: async (data: { projectId: string; workspaceId: string }) => {
      // makes a PUT request to /projects/id/approve to approve the project
      return updateData(`/projects/${data.projectId}/approve`, {});
    },

    // onSuccess: This runs AFTER the API call succeeds
    onSuccess: (_data, variables) => {
      // Invalidate (refresh) the workspace query
      // This will refetch the projects list to show updated data
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};

export const useRejectProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: The DELETE API call
    mutationFn: async (data: { projectId: string; workspaceId: string }) => {
      // Make a DELETE request to reject the project
      return deleteData(`/projects/${data.projectId}/reject`);
    },

    // onSuccess: Refresh the data after deletion
    onSuccess: (_data, variables) => {
      // Invalidate the workspace query to refetch projects
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};
