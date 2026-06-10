import {
  buildBenefits,
  formatDeadlineLabel,
  formatFundingSummary,
  selectDefaultOpportunity
} from "./opportunity-view-model";
import { sampleOpportunities } from "./sample-opportunities";

const priorityOpportunity = selectDefaultOpportunity(sampleOpportunities);
const ciscoTraining = sampleOpportunities.find((opportunity) => opportunity.id === "cisco-netacad-cybersecurity-2026");
const cernInternship = sampleOpportunities.find((opportunity) => opportunity.id === "cern-technical-student-2026");

if (priorityOpportunity.id !== "cern-technical-student-2026") {
  throw new Error("Default selection must prefer the highest scoring opportunity.");
}

if (ciscoTraining === undefined || formatDeadlineLabel(ciscoTraining) !== "À vérifier") {
  throw new Error("Unknown deadlines must be explicit.");
}

if (cernInternship === undefined || formatFundingSummary(cernInternship) !== "Partiellement financée · 3 407 CHF/mois") {
  throw new Error("Funding summary must expose monthly allowance.");
}

if (cernInternship !== undefined && buildBenefits(cernInternship)[0].confirmed !== true) {
  throw new Error("Monthly stipend benefit must be confirmed when present.");
}
