import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTriggerAIReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; plagiarismThreshold: number }) =>
      postData(`/ai-review/${data.projectId}/review`, {
        plagiarismThreshold: data.plagiarismThreshold,
      }),
    onSuccess: (_data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
      queryClient.invalidateQueries({
        queryKey: ["ai-review", variables.projectId],
      });
    },
  });
};

export const useGetAIReviewQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["ai-review", projectId],
    queryFn: () => fetchData(`/ai-review/${projectId}/review`),
    enabled: !!projectId,
  });
};

export const useBulkAIFilterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { workspaceId: string }) =>
      postData(`/ai-review/${data.workspaceId}/bulk-filter`, {}),
    onSuccess: (_data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};
