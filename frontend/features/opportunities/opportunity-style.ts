import type { ApplicationStatus, DocumentStatus, ScoreBand } from "@/types/opportunity";

export const scoreBandLabel: Record<ScoreBand, string> = {
  priority: "Prioritaire",
  analyze: "A analyser",
  low_priority: "Faible priorite",
  archive_candidate: "A archiver"
};

export const scoreBandClassName: Record<ScoreBand, string> = {
  priority: "border-success/30 bg-success/10 text-success",
  analyze: "border-accent/30 bg-accent/10 text-accent-strong",
  low_priority: "border-warning/30 bg-warning/10 text-warning",
  archive_candidate: "border-danger/30 bg-danger/10 text-danger"
};

export const statusLabel: Record<ApplicationStatus, string> = {
  new: "Nouveau",
  to_analyze: "A analyser",
  priority: "Prioritaire",
  preparing: "Dossier",
  applied: "Postule",
  result: "Resultat",
  archived: "Archive"
};

export const documentStatusLabel: Record<DocumentStatus, string> = {
  ready: "Pret",
  missing: "Manquant",
  optional: "Optionnel",
  to_update: "A mettre a jour"
};

export const documentStatusClassName: Record<DocumentStatus, string> = {
  ready: "text-success",
  missing: "text-danger",
  optional: "text-muted",
  to_update: "text-warning"
};
