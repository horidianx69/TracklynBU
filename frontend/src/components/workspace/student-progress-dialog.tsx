import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetStudentProgressQuery } from "@/hooks/use-workspace";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Tag,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

interface StudentProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

export const StudentProgressDialog = ({
  open,
  onOpenChange,
}: StudentProgressDialogProps) => {
  const [emailInput, setEmailInput] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(
    null
  );

  const { data, isLoading, isError, error } = useGetStudentProgressQuery(
    searchEmail || undefined
  ) as {
    data: any;
    isLoading: boolean;
    isError: boolean;
    error: any;
  };

  const handleSearch = () => {
    if (emailInput.trim()) {
      setSearchEmail(emailInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const getTrend = () => {
    if (!data?.workspaces || data.workspaces.length < 2) return "neutral";
    const ws = data.workspaces;
    const last = ws[ws.length - 1].totalMarks;
    const secondLast = ws[ws.length - 2].totalMarks;
    if (last > secondLast) return "up";
    if (last < secondLast) return "down";
    return "neutral";
  };

  const handleExportExcel = () => {
    if (!data) return;

    const rows: any[] = [];

    // All tasks detail
    data.allTasks?.forEach((task: any, i: number) => {
      rows.push({
        "#": i + 1,
        Workspace: task.workspaceName,
        Project: task.projectTitle,
        "Task Title": task.title,
        Marks: task.marks,
        Tags: (task.tags || []).join(", "),
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 4 },
      { wch: 25 },
      { wch: 25 },
      { wch: 30 },
      { wch: 8 },
      { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Progress");

    const today = new Date().toISOString().split("T")[0];
    const studentName = data.student?.name?.replace(/\s/g, "_") || "student";
    XLSX.writeFile(workbook, `${studentName}_Progress_${today}.xlsx`);
  };

  // Prepare chart data
  const barChartData =
    data?.workspaces?.map((ws: any) => ({
      name: ws.workspaceName.length > 15 
        ? ws.workspaceName.substring(0, 15) + "…" 
        : ws.workspaceName,
      marks: ws.totalMarks,
      tasks: ws.taskCount,
    })) || [];

  const pieChartData = data?.tagDistribution
    ? Object.entries(data.tagDistribution).map(([tag, count]) => ({
        name: tag,
        value: count as number,
      }))
    : [];

  const trend = data?.workspaces?.length >= 2 ? getTrend() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="size-5 text-primary" />
            Student Progress Tracker
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter student's email address..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
            <Search className="size-4" />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Error */}
        {isError && (
          <div className="text-center p-4 text-destructive text-sm">
            {(error as any)?.response?.data?.message || "Failed to fetch student data"}
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6 mt-2">
            {/* Student Profile Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 border-2 shadow-md">
                  <AvatarImage src={data.student.profilePicture} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {data.student.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">
                    {data.student.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.student.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {data.workspaces.length} workspace
                      {data.workspaces.length !== 1 ? "s" : ""}
                    </Badge>
                    {trend === "up" && (
                      <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
                        <TrendingUp className="size-3 mr-1" /> Improving
                      </Badge>
                    )}
                    {trend === "down" && (
                      <Badge className="bg-red-500/15 text-red-600 border-red-500/30">
                        <TrendingDown className="size-3 mr-1" /> Declining
                      </Badge>
                    )}
                    {trend === "neutral" && data.workspaces.length >= 2 && (
                      <Badge className="bg-gray-500/15 text-gray-600 border-gray-500/30">
                        <Minus className="size-3 mr-1" /> Steady
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {data.allTasks?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="gap-2 shrink-0"
                >
                  <Download className="size-4" />
                  Export
                </Button>
              )}
            </div>

            {/* No data state */}
            {data.workspaces.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                This student has no graded tasks in your workspaces yet.
              </div>
            )}

            {data.workspaces.length > 0 && (
              <>
                {/* Marks Trend Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      Marks Across Workspaces
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar
                          dataKey="marks"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          name="Total Marks"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Tag Distribution */}
                {pieChartData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Tag className="size-4 text-primary" />
                        Skill / Tag Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={(props: any) =>
                              `${props.name} (${(props.percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                          >
                            {pieChartData.map((_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Workspace Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Workspace Details
                  </h4>
                  {data.workspaces.map((ws: any) => (
                    <Card
                      key={ws.workspaceId}
                      className="overflow-hidden"
                    >
                      <button
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                        onClick={() =>
                          setExpandedWorkspace(
                            expandedWorkspace === ws.workspaceId
                              ? null
                              : ws.workspaceId
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: ws.workspaceColor || "#8b5cf6",
                            }}
                          />
                          <div>
                            <span className="font-semibold text-sm">
                              {ws.workspaceName}
                            </span>
                            <div className="flex gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {ws.projectCount} project
                                {ws.projectCount !== 1 ? "s" : ""}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {ws.taskCount} task
                                {ws.taskCount !== 1 ? "s" : ""} graded
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary">
                            {ws.totalMarks}
                          </span>
                          {expandedWorkspace === ws.workspaceId ? (
                            <ChevronUp className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {expandedWorkspace === ws.workspaceId && (
                        <div className="border-t px-4 pb-4">
                          {ws.projects.map((proj: any) => (
                            <div key={proj.projectTitle} className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {proj.projectTitle}
                                </span>
                                <div className="flex gap-1">
                                  {proj.projectTags?.map((tag: string) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-1">
                                {proj.tasks.map((task: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground text-xs">
                                        {i + 1}.
                                      </span>
                                      <span>{task.title}</span>
                                      {task.tags?.map((tag: string) => (
                                        <Badge
                                          key={tag}
                                          variant="outline"
                                          className="text-[9px] px-1 py-0"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <span className="font-semibold text-primary">
                                      {task.marks}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
