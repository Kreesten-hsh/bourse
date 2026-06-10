import type { OpportunityStatus, OpportunityType } from "@/types/opportunity";

export type ScoreBand = "high" | "mid" | "low";

export function getScoreBand(score: number): ScoreBand {
  if (score >= 80) {
    return "high";
  }

  if (score >= 60) {
    return "mid";
  }

  return "low";
}

export const scoreBandClassName: Record<ScoreBand, string> = {
  high: "bg-[var(--score-high)] text-surface-2",
  mid: "bg-[var(--score-mid)] text-surface-2",
  low: "bg-[var(--score-low)] text-surface-2"
};

export const statusLabel: Record<OpportunityStatus, string> = {
  new: "Nouveau",
  analyzing: "À analyser",
  priority: "Prioritaire",
  applying: "Dossier en cours",
  applied: "Postulé",
  result: "Résultat",
  archived: "Archivée"
};

export const statusClassName: Record<OpportunityStatus, string> = {
  new: "border-border bg-surface-2 text-ink-60",
  analyzing: "border-royal-mid bg-royal-light text-royal",
  priority: "border-success bg-success-bg text-success",
  applying: "border-warning bg-warning-bg text-warning",
  applied: "border-royal bg-[var(--royal-alpha10)] text-royal",
  result: "border-border bg-surface-3 text-ink",
  archived: "border-danger bg-danger-bg text-danger"
};

export const typeLabel: Record<OpportunityType, string> = {
  scholarship: "Bourse",
  internship: "Stage",
  job: "Emploi",
  fellowship: "Fellowship",
  training: "Formation",
  volunteer: "Volontariat"
};

export const typeClassName: Record<OpportunityType, string> = {
  scholarship: "border-royal bg-[var(--royal-alpha10)] text-royal",
  internship: "border-success bg-success-bg text-success",
  job: "border-warning bg-warning-bg text-warning",
  fellowship: "border-royal-mid bg-royal-light text-royal",
  training: "border-pink-border bg-pink text-pink-text",
  volunteer: "border-border bg-surface-3 text-ink-60"
};
