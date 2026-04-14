import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { WorkspaceLeaderboard } from "@/components/workspace/workspace-leaderboard";
import { StudentProgressDialog } from "@/components/workspace/student-progress-dialog";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import { useAuth } from "@/provider/auth-context";
import { Button } from "@/components/ui/button";
import { UserSearch } from "lucide-react";
import { useState } from "react";
import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const { user } = useAuth();
  const [isStudentProgressOpen, setIsStudentProgressOpen] = useState(false);
  const isFaculty = user?.role === "faculty" || user?.role === "admin";

  const shouldFetch = Boolean(workspaceId);

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId!) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };

  // 🧠 Handle when no workspace is selected
  if (!shouldFetch) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a workspace to view its dashboard</p>
      </div>
    );
  }

  if (isPending) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available for this workspace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {isFaculty && (
          <Button
            variant="outline"
            onClick={() => setIsStudentProgressOpen(true)}
            className="gap-2"
          >
            <UserSearch className="size-4" />
            Track Student
          </Button>
        )}
      </div>

      <WorkspaceLeaderboard workspaceId={workspaceId!} />

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>

      <StudentProgressDialog
        open={isStudentProgressOpen}
        onOpenChange={setIsStudentProgressOpen}
      />
    </div>
  );
};

export default Dashboard;

