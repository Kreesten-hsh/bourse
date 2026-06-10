import type { ApplicationStatus, DocumentStatus, ScoreBand } from "@/types/opportunity";

export const scoreBandLabel: Record<ScoreBand, string> = {
  priority: "Prioritaire",
  analyze: "A analyser",
  low_priority: "Faible priorite",
  archive_candidate: "A archiver"
};

export const scoreBandClassName: Record<ScoreBand, string> = {
  priority: "border-[rgb(44_141_103_/_0.28)] bg-[rgb(44_141_103_/_0.1)] text-success",
  analyze: "border-[rgb(52_71_170_/_0.28)] bg-[rgb(52_71_170_/_0.1)] text-accent-strong",
  low_priority: "border-[rgb(165_106_23_/_0.28)] bg-[rgb(165_106_23_/_0.1)] text-warning",
  archive_candidate: "border-[rgb(184_68_85_/_0.28)] bg-[rgb(184_68_85_/_0.1)] text-danger"
};

export const statusClassName: Record<ApplicationStatus, string> = {
  new: "border-[rgb(109_114_144_/_0.24)] bg-white/40 text-muted",
  to_analyze: "border-[rgb(52_71_170_/_0.24)] bg-[rgb(52_71_170_/_0.08)] text-accent-strong",
  priority: "border-[rgb(44_141_103_/_0.24)] bg-[rgb(44_141_103_/_0.1)] text-success",
  preparing: "border-[rgb(165_106_23_/_0.24)] bg-[rgb(165_106_23_/_0.09)] text-warning",
  applied: "border-[rgb(52_71_170_/_0.24)] bg-[rgb(52_71_170_/_0.12)] text-accent-strong",
  result: "border-[rgb(17_25_54_/_0.18)] bg-[rgb(17_25_54_/_0.07)] text-foreground",
  archived: "border-[rgb(184_68_85_/_0.22)] bg-[rgb(184_68_85_/_0.08)] text-danger"
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
