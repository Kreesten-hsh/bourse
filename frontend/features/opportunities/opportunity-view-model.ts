import type { Opportunity, ScoreBand } from "@/types/opportunity";

const scoreBandPriority: Record<ScoreBand, number> = {
  priority: 4,
  analyze: 3,
  low_priority: 2,
  archive_candidate: 1
};

export function selectDefaultOpportunity(opportunities: ReadonlyArray<Opportunity>): Opportunity {
  if (opportunities.length === 0) {
    throw new Error("Cannot select a default opportunity from an empty list.");
  }

  return [...opportunities].sort((first: Opportunity, second: Opportunity) => {
    const bandDelta = scoreBandPriority[second.scoreBand] - scoreBandPriority[first.scoreBand];

    if (bandDelta !== 0) {
      return bandDelta;
    }

    return second.fitScore - first.fitScore;
  })[0];
}

export function summarizeOpportunityBenefits(opportunity: Opportunity): string {
  if (opportunity.benefits.length === 0) {
    return "Aucun avantage confirme";
  }

  return opportunity.benefits
    .slice(0, 2)
    .map((benefit) => `${benefit.label}: ${benefit.value}`)
    .join(", ");
}

export function formatDeadlineLabel(opportunity: Opportunity): string {
  if (opportunity.deadlineConfidence === "unknown" || opportunity.deadline === null || opportunity.daysRemaining === null) {
    return "Deadline a verifier";
  }

  if (opportunity.isExpired) {
    return "Expiree";
  }

  if (opportunity.daysRemaining === 0) {
    return "Dernier jour";
  }

  if (opportunity.daysRemaining === 1) {
    return "1 jour restant";
  }

  return `${opportunity.daysRemaining} jours restants`;
}

export function formatFundingStatus(opportunity: Opportunity): string {
  const labels: Record<Opportunity["fundingStatus"], string> = {
    fully_funded: "Entierement financee",
    partially_funded: "Partiellement financee",
    paid: "Payee",
    unpaid: "Non financee",
    unknown: "Financement a verifier"
  };

  return labels[opportunity.fundingStatus];
}

export function formatOpportunityType(opportunity: Opportunity): string {
  const labels: Record<Opportunity["type"], string> = {
    scholarship: "Bourse",
    internship: "Stage",
    fellowship: "Fellowship",
    training: "Formation",
    job: "Emploi",
    volunteering: "Volontariat",
    exchange: "Echange",
    competition: "Competition"
  };

  return labels[opportunity.type];
}

export function formatDestination(opportunity: Opportunity): string {
  if (opportunity.destinationCity === null) {
    return opportunity.destinationCountry;
  }

  return `${opportunity.destinationCity}, ${opportunity.destinationCountry}`;
}
