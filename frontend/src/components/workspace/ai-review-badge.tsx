import type { AIReviewStatus } from "@/types";
import { Badge } from "../ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  Clock,
  Sparkles,
} from "lucide-react";

interface AIReviewBadgeProps {
  status: AIReviewStatus;
  plagiarismScore?: number;
  className?: string;
}

const statusConfig: Record<
  AIReviewStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  pending: {
    label: "Pending AI Review",
    icon: Clock,
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600",
  },
  approved: {
    label: "AI Approved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  },
  needs_review: {
    label: "Needs Review",
    icon: AlertTriangle,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  },
  plagiarism_detected: {
    label: "Plagiarism Detected",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-700",
  },
  below_benchmark: {
    label: "Below Benchmark",
    icon: TrendingDown,
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-700",
  },
};

export const AIReviewBadge = ({
  status,
  plagiarismScore,
  className = "",
}: AIReviewBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 py-1 px-2.5 text-xs font-medium ${config.className} ${className}`}
    >
      <Sparkles className="w-3 h-3 opacity-60" />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {status === "plagiarism_detected" && plagiarismScore !== undefined && (
        <span className="font-bold">({plagiarismScore}%)</span>
      )}
    </Badge>
  );
};
