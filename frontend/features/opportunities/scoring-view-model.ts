import type { Opportunity } from "@/types/opportunity";

const scoreLabels: Record<string, string> = {
  funding_full: "Entièrement financée",
  monthly_stipend: "Allocation mensuelle",
  global_nationality: "Ouvert international",
  technical_domain: "Domaine tech / cyber",
  undergrad_level: "Niveau compatible",
  deadline_window: "Échéance exploitable",
  travel_covered: "Billet aller-retour",
  housing_covered: "Logement inclus",
  application_fee: "Frais de candidature",
  restrictive_nationality: "Nationalité restrictive",
  advanced_degree_required: "Niveau master/PhD",
  no_funding: "Non financée",
  unconfirmed_deadline: "Échéance non confirmée"
};

export type ScoreLine = Readonly<{
  key: string;
  label: string;
  value: number;
}>;

export function buildScoreLines(opportunity: Opportunity): ReadonlyArray<ScoreLine> {
  return Object.entries(opportunity.score_breakdown)
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => ({
      key,
      label: scoreLabels[key] ?? key,
      value
    }));
}

export function formatScoreLine(line: ScoreLine): string {
  const prefix = line.value > 0 ? "+" : "";

  return `${prefix}${line.value} ${line.label}`;
}
