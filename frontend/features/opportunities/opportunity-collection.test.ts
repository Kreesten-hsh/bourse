import type { Opportunity } from "@/types/opportunity";
import { applyOpportunityQuery, applyStatusChange, sortOpportunities } from "./opportunity-collection";
import { sampleOpportunities } from "./sample-opportunities";

const fundedCyberMatches = applyOpportunityQuery(sampleOpportunities, {
  searchTerm: "cyber africa",
  activeFilters: ["funded"]
});

if (fundedCyberMatches.length !== 1 || fundedCyberMatches[0].id !== "african-cyber-fellows-2026") {
  throw new Error("Search and funded filter must isolate the African cyber fellowship.");
}

const deadlineSorted = sortOpportunities(sampleOpportunities, "deadline");
const firstDatedOpportunity = deadlineSorted[0];

if (firstDatedOpportunity.id !== "undp-digital-transformation-internship") {
  throw new Error("Deadline sorting must prioritize the closest confirmed deadline.");
}

const originalOpportunity: Opportunity = sampleOpportunities[0];
const updatedOpportunity = applyStatusChange(originalOpportunity, "preparing");

if (originalOpportunity.status === updatedOpportunity.status) {
  throw new Error("Status change must return an updated opportunity.");
}

if (originalOpportunity.status !== "priority") {
  throw new Error("Status change must not mutate the original opportunity.");
}
