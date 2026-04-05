import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/types";

interface ScoreboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentScores?: {
    student: User;
    totalMarks: number;
  }[];
}

export function ScoreboardDialog({ open, onOpenChange, studentScores }: ScoreboardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-opacity-95 backdrop-blur-xl border border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            Project Scoreboard
          </DialogTitle>
          <DialogDescription>
            Final marks aggregated for all team members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {!studentScores || studentScores.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No scores available yet.</p>
          ) : (
            studentScores.map((score, index) => (
              <div 
                key={score.student?._id || index} 
                className="flex items-center justify-between p-4 rounded-2xl bg-card border shadow-sm transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
                    {score.student?.profilePicture ? (
                      <img src={score.student.profilePicture} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-purple-600 font-bold text-lg">{score.student?.name?.charAt(0) || "S"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-md text-foreground">{score.student?.name || "Unknown"}</h3>
                    <p className="text-xs text-muted-foreground">{score.student?.email || ""}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end pt-1">
                  <div className="text-2xl font-black text-purple-600 drop-shadow-sm">{score.totalMarks}</div>
                  <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Total Marks</div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
