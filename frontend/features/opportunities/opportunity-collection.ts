import type { FundingType, Opportunity, OpportunityStatus } from "@/types/opportunity";
import { getDaysUntilDeadline, isExpiredOpportunity } from "./opportunity-view-model";

export type OpportunityFilter = "funded" | "tech" | "africa_global" | "urgent" | "needs_review" | "archived";
export type OpportunitySort = "score" | "deadline" | "funding" | "recent";

export type OpportunityQuery = Readonly<{
  searchTerm: string;
  activeFilters: ReadonlyArray<OpportunityFilter>;
}>;

const fundingRank: Record<FundingType, number> = {
  full: 4,
  partial: 3,
  unknown: 2,
  none: 1
};

const technicalTerms = ["informatique", "cybersécurité", "cybersecurite", "logiciel", "software", "données", "data", "tic", "ict", "ia", "ai", "cyber"] as const;

export function applyOpportunityQuery(
  opportunities: ReadonlyArray<Opportunity>,
  query: OpportunityQuery
): ReadonlyArray<Opportunity> {
  const searchTokens = normalizeSearch(query.searchTerm);

  return opportunities.filter((opportunity) => {
    const matchesSearch = searchTokens.every((token) => buildSearchText(opportunity).includes(token));

    if (!matchesSearch) {
      return false;
    }

    return query.activeFilters.every((filter) => matchesFilter(opportunity, filter));
  });
}

export function sortOpportunities(
  opportunities: ReadonlyArray<Opportunity>,
  sort: OpportunitySort
): ReadonlyArray<Opportunity> {
  return [...opportunities].sort((first, second) => {
    if (sort === "deadline") {
      return deadlineSortValue(first) - deadlineSortValue(second);
    }

    if (sort === "funding") {
      return fundingRank[second.funding_type] - fundingRank[first.funding_type];
    }

    if (sort === "recent") {
      return Date.parse(second.collected_at) - Date.parse(first.collected_at);
    }

    return second.score - first.score;
  });
}

export function applyStatusChange(opportunity: Opportunity, status: OpportunityStatus): Opportunity {
  return {
    ...opportunity,
    status,
    updated_at: new Date().toISOString()
  };
}

export function updateOpportunityStatus(
  opportunities: ReadonlyArray<Opportunity>,
  opportunityId: string,
  status: OpportunityStatus
): ReadonlyArray<Opportunity> {
  return opportunities.map((opportunity) => {
    if (opportunity.id !== opportunityId) {
      return opportunity;
    }

    return applyStatusChange(opportunity, status);
  });
}

function matchesFilter(opportunity: Opportunity, filter: OpportunityFilter): boolean {
  if (filter === "funded") {
    return opportunity.funding_type === "full" || opportunity.monthly_stipend !== null || opportunity.tuition_covered === true;
  }

  if (filter === "tech") {
    return hasTechnicalDomain(opportunity);
  }

  if (filter === "africa_global") {
    return matchesAfricaOrGlobal(opportunity.required_nationality);
  }

  if (filter === "urgent") {
    const days = getDaysUntilDeadline(opportunity);

    return days !== null && days >= 0 && days < 14;
  }

  if (filter === "archived") {
    return opportunity.status === "archived";
  }

  return opportunity.deadline_confirmed === false || opportunity.funding_type === "unknown";
}

function normalizeSearch(searchTerm: string): ReadonlyArray<string> {
  return searchTerm
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function buildSearchText(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.organization,
    opportunity.destination_country ?? "",
    opportunity.destination_city ?? "",
    opportunity.type,
    opportunity.funding_type,
    opportunity.status,
    ...opportunity.required_domains,
    ...opportunity.required_languages,
    opportunity.summary ?? "",
    opportunity.eligibility_notes ?? ""
  ]
    .join(" ")
    .toLowerCase();
}

function hasTechnicalDomain(opportunity: Opportunity): boolean {
  const domainText = opportunity.required_domains.join(" ").toLowerCase();

  return technicalTerms.some((term) => domainText.includes(term));
}

function matchesAfricaOrGlobal(requiredNationality: string | null): boolean {
  if (requiredNationality === null) {
    return true;
  }

  return /africa|afrique|benin|bénin|global|international/i.test(requiredNationality);
}

function deadlineSortValue(opportunity: Opportunity): number {
  if (isExpiredOpportunity(opportunity)) {
    return Number.POSITIVE_INFINITY;
  }

  const days = getDaysUntilDeadline(opportunity);

  if (days === null) {
    return Number.POSITIVE_INFINITY;
  }

  return days;
}
