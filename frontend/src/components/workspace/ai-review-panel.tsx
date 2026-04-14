import { useState } from "react";
import type { AIReview } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  FileWarning,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface AIReviewPanelProps {
  aiReview: AIReview;
}

export const AIReviewPanel = ({ aiReview }: AIReviewPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!aiReview || aiReview.status === "pending") return null;

  return (
    <div className="border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between py-2 px-3 h-auto text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          AI Review Details
        </span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </Button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {aiReview.reviewComment && (
            <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
              <h4 className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                AI Assessment
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{aiReview.reviewComment}</p>
            </div>
          )}

          {aiReview.benchmarkSummary && (
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 border border-blue-200/50 dark:border-blue-800/30">
              <h4 className="text-xs font-semibold mb-1 text-blue-700 dark:text-blue-300">12-Hour Benchmark Standard</h4>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">{aiReview.benchmarkSummary}</p>
            </div>
          )}

          {aiReview.similarProjects && aiReview.similarProjects.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <FileWarning className="w-3.5 h-3.5 text-red-500" />
                Similar Projects Found
              </h4>
              <div className="space-y-2">
                {aiReview.similarProjects.map((sp, idx) => (
                  <div key={idx} className="rounded-lg border border-border/50 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{sp.projectTitle}</span>
                      <span className="text-xs font-bold">{sp.similarityScore}% match</span>
                    </div>
                    <Progress value={sp.similarityScore} className="h-1.5" />
                    {sp.reasoning && <p className="text-xs text-muted-foreground mt-1.5">{sp.reasoning}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiReview.benchmarks && aiReview.benchmarks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Project Benchmarks (12-hour standard)
              </h4>
              <div className="grid gap-1.5">
                {aiReview.benchmarks.map((benchmark, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-md bg-muted/30 p-2 border border-border/30">
                    {benchmark.met ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-zinc-400" />}
                    <div>
                      <span className="text-xs font-semibold block">{benchmark.category}</span>
                      <span className="text-xs text-muted-foreground">{benchmark.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
