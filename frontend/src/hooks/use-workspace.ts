import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery } from "@tanstack/react-query";

// --- Create Workspace ---
export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
  });
};

// --- Get All Workspaces ---
export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
  });
};

// --- Get Workspace Projects ---
export const useGetWorkspaceQuery = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
  });
};

// --- Get Workspace Stats ---
export const useGetWorkspaceStatsQuery = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
    enabled: !!workspaceId,
  });
};

// --- Get Workspace Details ---
export const useGetWorkspaceDetailsQuery = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
    enabled: !!workspaceId,
  });
};

// --- Get Workspace Invite Info (no membership required) ---
export const useGetWorkspaceInviteInfoQuery = (workspaceId?: string, tk?: string, jt?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "invite-info", tk, jt],
    queryFn: async () => {
      let url = `/workspaces/${workspaceId}/invite-info`;
      const params = new URLSearchParams();
      if (tk) params.append("tk", tk);
      if (jt) params.append("jt", jt);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      return fetchData(url);
    },
    enabled: !!workspaceId && (!!tk || !!jt),
    retry: false,
  });
};

// --- Invite Member ---
export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspaces/${data.workspaceId}/invite-member`, data),
  });
};

// --- Accept Invite by Token ---
export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspaces/accept-invite-token`, { token }),
  });
};

// --- Generate Join Token (for QR/link sharing) ---
export const useGenerateJoinTokenMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspaces/${workspaceId}/generate-join-token`, {}),
  });
};

// --- Accept Generate Invite Link (with join token) ---
export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (data: { workspaceId: string; joinToken: string }) =>
      postData(`/workspaces/${data.workspaceId}/accept-generate-invite`, {
        joinToken: data.joinToken,
      }),
  });
};

// --- Get Workspace Leaderboard ---
export const useGetWorkspaceLeaderboardQuery = (workspaceId?: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "leaderboard"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/leaderboard`),
    enabled: !!workspaceId,
  });
};

// --- Get Student Progress (Cross-Workspace) ---
export const useGetStudentProgressQuery = (email?: string) => {
  return useQuery({
    queryKey: ["student-progress", email],
    queryFn: async () =>
      fetchData(`/workspaces/student-progress/search?email=${encodeURIComponent(email!)}`),
    enabled: !!email && email.length > 0,
  });
};
