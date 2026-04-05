import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import {
  useSmartGradeMutation,
  useApplySmartGradeMutation,
} from "@/hooks/use-task";
import { useUpdateProjectRubricMutation } from "@/hooks/use-project";
import { toast } from "sonner";
import type { Project } from "@/types";

interface SmartGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

interface SmartEval {
  taskId: string;
  taskTitle: string;
  assigneeNames: string;
  suggestedMarks: number;
  reasoning: string;
}

export const SmartGradeDialog = ({
  open,
  onOpenChange,
  project,
}: SmartGradeDialogProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [rubric, setRubric] = useState(project.gradingRubric || "");
  const [evaluations, setEvaluations] = useState<SmartEval[]>([]);
  const [editableMarks, setEditableMarks] = useState<Record<string, number>>({});

  const updateRubricMutation = useUpdateProjectRubricMutation();
  const smartGradeMutation = useSmartGradeMutation();
  const applyGradesMutation = useApplySmartGradeMutation();

  // Reset dialog state when opened
  useEffect(() => {
    if (open) {
      setStep(1);
      setRubric(project.gradingRubric || "");
      setEvaluations([]);
      setEditableMarks({});
    }
  }, [open, project.gradingRubric]);

  const handleRunSmartGrade = async () => {
    // 1. Save Rubric first
    try {
      await updateRubricMutation.mutateAsync({
        projectId: project._id,
        gradingRubric: rubric,
      });

      // 2. Trigger AI Evaluation
      const res = await smartGradeMutation.mutateAsync({
        projectId: project._id,
      }) as any;

      // 3. Setup editable marks state
      const initialMarks: Record<string, number> = {};
      res.evaluations.forEach((ev: SmartEval) => {
        initialMarks[ev.taskId] = ev.suggestedMarks;
      });

      setEvaluations(res.evaluations);
      setEditableMarks(initialMarks);
      setStep(2);
      
      toast.success("AI grading complete! Please review.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to run AI grading.";
      toast.error(msg);
    }
  };

  const handleApplyGrades = async () => {
    try {
      const finalEvaluations = evaluations.map((ev) => ({
        taskId: ev.taskId,
        marks: editableMarks[ev.taskId] || 0,
      }));

      await applyGradesMutation.mutateAsync({
        projectId: project._id,
        evaluations: finalEvaluations,
      });

      toast.success("Marks applied successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to apply marks.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-amber-500" />
            Smart AI Grading
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2">
          {step === 1 ? (
            <div className="space-y-4 flex flex-col h-full">
              <div className="bg-amber-500/10 text-amber-600 p-3 rounded-md text-sm flex gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <p>
                  Define your grading rubric below. The AI will evaluate all ungraded tasks sitting in the "Done" lane based on these rules.
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium">Grading Parameters (Rubric)</label>
                <Textarea
                  placeholder="Example: This project requires 20 hours total. Complex API tasks are worth max 15 marks. Basic UI tweaks are worth max 5 marks. Give zero if subtasks are uncompleted..."
                  className="flex-1 resize-none h-40"
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRunSmartGrade}
                  disabled={smartGradeMutation.isPending || updateRubricMutation.isPending}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md shadow-amber-500/20"
                >
                  {(smartGradeMutation.isPending || updateRubricMutation.isPending) ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Evaluate Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-semibold text-sm text-foreground">
                  Review AI Suggestions
                </h3>
                <Badge variant="secondary">{evaluations.length} Tasks Graded</Badge>
              </div>

              <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-4 pb-4">
                  {evaluations.map((ev) => (
                    <div
                      key={ev.taskId}
                      className="border rounded-lg p-4 bg-muted/20 relative"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 pr-16">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm text-foreground">
                              {ev.taskTitle}
                            </h4>
                            <ChevronRight className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              {ev.assigneeNames}
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground/80 mt-2 bg-muted p-2 rounded italic">
                            <strong className="text-amber-500 not-italic mr-1 text-[10px] uppercase">Reasoning:</strong>
                            {ev.reasoning}
                          </p>
                        </div>

                        <div className="absolute right-4 top-4 flex flex-col items-center gap-1 bg-background p-2 rounded-md border shadow-sm">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Marks</span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="w-16 h-8 text-center text-lg font-bold border-amber-500/30 focus-visible:ring-amber-500/50"
                            value={editableMarks[ev.taskId] ?? 0}
                            onChange={(e) =>
                              setEditableMarks((prev) => ({
                                ...prev,
                                [ev.taskId]: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-2 flex justify-between gap-3 border-t">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back to Rubric
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApplyGrades}
                    disabled={applyGradesMutation.isPending}
                    className="gap-2 bg-primary text-primary-foreground shadow-md"
                  >
                    {applyGradesMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Apply {evaluations.length} Marks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
