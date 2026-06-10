import type { FundingType, Opportunity, OpportunityBenefit, OpportunityCondition, OpportunityType } from "@/types/opportunity";

const fundingLabels: Record<FundingType, string> = {
  full: "Entièrement financée",
  partial: "Partiellement financée",
  none: "Non financée",
  unknown: "Non confirmé"
};

const typeLabels: Record<OpportunityType, string> = {
  scholarship: "Bourse",
  internship: "Stage",
  job: "Emploi",
  fellowship: "Fellowship",
  training: "Formation",
  volunteer: "Volontariat"
};

export function selectDefaultOpportunity(opportunities: ReadonlyArray<Opportunity>): Opportunity {
  if (opportunities.length === 0) {
    throw new Error("Cannot select a default opportunity from an empty list.");
  }

  return [...opportunities].sort((first, second) => second.score - first.score)[0];
}

export function formatOpportunityType(type: OpportunityType): string {
  return typeLabels[type];
}

export function formatDestination(opportunity: Opportunity): string {
  if (opportunity.is_remote) {
    return "Remote";
  }

  if (opportunity.destination_city !== null && opportunity.destination_country !== null) {
    return `${opportunity.destination_city}, ${opportunity.destination_country}`;
  }

  return opportunity.destination_country ?? "À vérifier";
}

export function formatFundingSummary(opportunity: Opportunity): string {
  if (opportunity.funding_type === "unknown") {
    return "Non confirmé";
  }

  if (opportunity.monthly_stipend !== null && opportunity.monthly_stipend > 0) {
    const currency = opportunity.monthly_stipend_currency ?? "USD";

    return `${fundingLabels[opportunity.funding_type]} · ${opportunity.monthly_stipend.toLocaleString("fr-FR")} ${currency}/mois`;
  }

  return fundingLabels[opportunity.funding_type];
}

export function formatDeadlineLabel(opportunity: Opportunity): string {
  if (opportunity.deadline === null || opportunity.deadline_confirmed === false) {
    return "À vérifier";
  }

  if (isExpiredOpportunity(opportunity)) {
    return "Expirée";
  }

  const remainingDays = getDaysUntilDeadline(opportunity);

  if (remainingDays === null) {
    return "À vérifier";
  }

  if (remainingDays === 0) {
    return "Dernier jour";
  }

  if (remainingDays === 1) {
    return "1 jour";
  }

  return `${remainingDays} jours`;
}

export function getDaysUntilDeadline(opportunity: Opportunity): number | null {
  if (opportunity.deadline === null) {
    return null;
  }

  const deadlineTime = Date.parse(opportunity.deadline);

  if (Number.isNaN(deadlineTime)) {
    return null;
  }

  const dayInMs = 86_400_000;

  return Math.ceil((deadlineTime - Date.now()) / dayInMs);
}

export function isExpiredOpportunity(opportunity: Opportunity): boolean {
  if (opportunity.status === "archived" && opportunity.expires_at !== null) {
    return Date.parse(opportunity.expires_at) <= Date.now();
  }

  const remainingDays = getDaysUntilDeadline(opportunity);

  return remainingDays !== null && remainingDays < 0;
}

export function buildBenefits(opportunity: Opportunity): ReadonlyArray<OpportunityBenefit> {
  return [
    {
      label: "Allocation mensuelle",
      value:
        opportunity.monthly_stipend !== null
          ? `${opportunity.monthly_stipend.toLocaleString("fr-FR")} ${opportunity.monthly_stipend_currency ?? "USD"}/mois`
          : "Non confirmé",
      confirmed: opportunity.monthly_stipend !== null && opportunity.monthly_stipend > 0
    },
    { label: "Billet aller-retour", value: booleanBenefit(opportunity.travel_covered), confirmed: opportunity.travel_covered === true },
    { label: "Logement", value: booleanBenefit(opportunity.housing_covered), confirmed: opportunity.housing_covered === true },
    { label: "Visa", value: booleanBenefit(opportunity.visa_covered), confirmed: opportunity.visa_covered === true },
    { label: "Assurance", value: booleanBenefit(opportunity.insurance_covered), confirmed: opportunity.insurance_covered === true },
    { label: "Frais de scolarité", value: booleanBenefit(opportunity.tuition_covered), confirmed: opportunity.tuition_covered === true }
  ];
}

export function buildConditions(opportunity: Opportunity): ReadonlyArray<OpportunityCondition> {
  return [
    { label: "Nationalité", value: opportunity.required_nationality ?? "Ouvert international", blocking: false },
    { label: "Âge", value: formatAgeRange(opportunity), blocking: false },
    { label: "Niveau", value: opportunity.required_level, blocking: ["masters", "phd"].includes(opportunity.required_level) },
    { label: "Domaine", value: opportunity.required_domains.join(", "), blocking: false },
    { label: "Langue", value: opportunity.required_languages.join(", "), blocking: false },
    {
      label: "Expérience",
      value: opportunity.required_experience_years === null ? "Non confirmé" : `${opportunity.required_experience_years} an(s)`,
      blocking: opportunity.required_experience_years !== null && opportunity.required_experience_years > 2
    }
  ];
}

export function summarizeTopAdvantages(opportunity: Opportunity): string {
  const confirmedBenefits = buildBenefits(opportunity)
    .filter((benefit) => benefit.confirmed)
    .map((benefit) => benefit.label);

  if (confirmedBenefits.length === 0) {
    return "Avantages à vérifier";
  }

  return confirmedBenefits.slice(0, 3).join(", ");
}

function booleanBenefit(value: boolean | null): string {
  if (value === true) {
    return "Inclus";
  }

  if (value === false) {
    return "Non inclus";
  }

  return "Non confirmé";
}

function formatAgeRange(opportunity: Opportunity): string {
  if (opportunity.age_min === null && opportunity.age_max === null) {
    return "Non spécifié";
  }

  if (opportunity.age_min !== null && opportunity.age_max !== null) {
    return `${opportunity.age_min}-${opportunity.age_max} ans`;
  }

  if (opportunity.age_min !== null) {
    return `${opportunity.age_min}+ ans`;
  }

  return `Jusqu'à ${opportunity.age_max} ans`;
}
