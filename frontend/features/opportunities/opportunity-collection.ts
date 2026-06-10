import type { ApplicationStatus, FundingStatus, Opportunity } from "@/types/opportunity";

export type OpportunityFilter = "funded" | "tech" | "africa" | "urgent" | "needs_review";
export type OpportunitySort = "score" | "deadline" | "funding" | "recent";

export type OpportunityQuery = Readonly<{
  searchTerm: string;
  activeFilters: ReadonlyArray<OpportunityFilter>;
}>;

const fundedStatuses: ReadonlySet<FundingStatus> = new Set(["fully_funded", "partially_funded", "paid"]);
const technicalDomains: ReadonlySet<Opportunity["domain"]> = new Set([
  "software",
  "cybersecurity",
  "data",
  "ai",
  "digital_transformation",
  "ict",
  "open_source",
  "product_engineering",
  "devops"
]);

export function applyOpportunityQuery(
  opportunities: ReadonlyArray<Opportunity>,
  query: OpportunityQuery
): ReadonlyArray<Opportunity> {
  const normalizedSearchTokens = query.searchTerm
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return opportunities.filter((opportunity) => {
    const searchText = buildSearchText(opportunity);
    const matchesSearch = normalizedSearchTokens.every((token) => searchText.includes(token));

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
      return fundingSortValue(second) - fundingSortValue(first);
    }

    if (sort === "recent") {
      return Date.parse(second.collectedAt) - Date.parse(first.collectedAt);
    }

    return second.fitScore - first.fitScore;
  });
}

export function applyStatusChange(opportunity: Opportunity, status: ApplicationStatus): Opportunity {
  return {
    ...opportunity,
    status
  };
}

export function updateOpportunityStatus(
  opportunities: ReadonlyArray<Opportunity>,
  opportunityId: string,
  status: ApplicationStatus
): ReadonlyArray<Opportunity> {
  return opportunities.map((opportunity) => {
    if (opportunity.id !== opportunityId) {
      return opportunity;
    }

    return applyStatusChange(opportunity, status);
  });
}

function buildSearchText(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.organization,
    opportunity.programName,
    opportunity.sourceName,
    opportunity.type,
    opportunity.domain,
    opportunity.destinationCountry,
    opportunity.destinationCity ?? "",
    opportunity.fundingStatus,
    ...opportunity.matchedStrengths,
    ...opportunity.scoreExplanation
  ]
    .join(" ")
    .toLowerCase();
}

function matchesFilter(opportunity: Opportunity, filter: OpportunityFilter): boolean {
  if (filter === "funded") {
    return fundedStatuses.has(opportunity.fundingStatus) && opportunity.fundingConfidence !== "ambiguous";
  }

  if (filter === "tech") {
    return technicalDomains.has(opportunity.domain);
  }

  if (filter === "africa") {
    return opportunity.eligibility.some((condition) => /africa|african|benin|global south/i.test(condition.value));
  }

  if (filter === "urgent") {
    return opportunity.daysRemaining !== null && opportunity.daysRemaining <= 14;
  }

  return opportunity.deadlineConfidence === "unknown" || opportunity.fundingConfidence === "ambiguous";
}

function deadlineSortValue(opportunity: Opportunity): number {
  if (opportunity.daysRemaining === null) {
    return Number.POSITIVE_INFINITY;
  }

  if (opportunity.isExpired) {
    return Number.POSITIVE_INFINITY;
  }

  return opportunity.daysRemaining;
}

function fundingSortValue(opportunity: Opportunity): number {
  const values: Record<FundingStatus, number> = {
    fully_funded: 5,
    paid: 4,
    partially_funded: 3,
    unknown: 2,
    unpaid: 1
  };

  return values[opportunity.fundingStatus];
}
