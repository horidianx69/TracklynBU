import { useGetWorkspaceLeaderboardQuery } from "@/hooks/use-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Award, ChevronDown, ChevronUp, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export const WorkspaceLeaderboard = ({ workspaceId }: { workspaceId: string }) => {
  const { data: leaderboard, isLoading } = useGetWorkspaceLeaderboardQuery(workspaceId) as {
    data: { student: { _id: string, name: string, profilePicture: string, email: string }, totalMarks: number }[];
    isLoading: boolean;
  };
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle>Workspace Leaderboard</CardTitle>
          <CardDescription>Loading top performers...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle>Workspace Leaderboard</CardTitle>
          <CardDescription>No graded tasks found yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const top10 = leaderboard.slice(0, 10);
  const rest = leaderboard.slice(10);
  const displayedList = showAll ? leaderboard : top10;

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-amber-100/30 border-amber-500/50 hover:bg-amber-100/50"; // Gold
    if (index === 1) return "bg-gray-100/30 border-gray-400/50 hover:bg-gray-100/50"; // Silver
    if (index === 2) return "bg-orange-100/30 border-orange-600/50 hover:bg-orange-100/50"; // Bronze
    if (index < 10) return "bg-background border-muted hover:bg-muted/30"; // Top 4-10
    return "bg-background/50 border-transparent hover:bg-muted/20 opacity-80"; // Rest
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="size-5 text-amber-500 drop-shadow-sm" />;
    if (index === 1) return <Medal className="size-5 text-gray-400 drop-shadow-sm" />;
    if (index === 2) return <Award className="size-5 text-orange-600 drop-shadow-sm" />;
    return <span className="font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const handleExportExcel = () => {
    if (!leaderboard || leaderboard.length === 0) return;

    const rows = leaderboard.map((entry, index) => ({
      Rank: index + 1,
      "Student Name": entry.student.name || "Unknown",
      Email: entry.student.email || "N/A",
      "Total Marks": entry.totalMarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = [
      { wch: 6 },  // Rank
      { wch: 25 }, // Student Name
      { wch: 30 }, // Email
      { wch: 14 }, // Total Marks
    ];
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Workspace_Leaderboard_${today}.xlsx`);
  };

  return (
    <Card className="shadow-md border-muted/60 overflow-hidden">
      <CardHeader className="bg-muted/10 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              Workspace Leaderboard
            </CardTitle>
            <CardDescription className="mt-1">
              Top performers across all projects in this workspace
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2 shrink-0"
          >
            <Download className="size-4" />
            Export Excel
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col">
          {displayedList.map((entry, index) => (
            <div
              key={entry.student._id}
              className={`flex items-center justify-between p-4 border-b last:border-0 transition-colors ${getRankStyle(index)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border shadow-sm">
                  {getRankIcon(index)}
                </div>
                
                <Avatar className="size-10 border shadow-sm">
                  <AvatarImage src={entry.student.profilePicture} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {entry.student.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {entry.student.name || "Unknown Student"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.student.email}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-primary">
                  {entry.totalMarks}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Marks
                </span>
              </div>
            </div>
          ))}

          {rest.length > 0 && (
            <div className="p-3 bg-muted/5 flex justify-center border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAll(!showAll)}
                className="text-xs w-full sm:w-auto"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="size-4 mr-1" />
                    Show Top 10 Only
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4 mr-1" />
                    Show All {leaderboard.length} Students
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
