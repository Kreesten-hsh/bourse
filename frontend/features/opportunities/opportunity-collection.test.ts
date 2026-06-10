import type { Opportunity } from "@/types/opportunity";
import { applyOpportunityQuery, applyStatusChange, sortOpportunities } from "./opportunity-collection";
import { sampleOpportunities } from "./sample-opportunities";

const fundedTechMatches = applyOpportunityQuery(sampleOpportunities, {
  searchTerm: "CERN software",
  activeFilters: ["funded", "tech"]
});

if (fundedTechMatches.length !== 1 || fundedTechMatches[0].id !== "cern-technical-student-2026") {
  throw new Error("Search and filters must isolate the CERN technical internship.");
}

const deadlineSorted = sortOpportunities(sampleOpportunities, "deadline");
const firstOpportunity = deadlineSorted[0];

if (firstOpportunity.id !== "afdb-ict-internship-2026") {
  throw new Error("Deadline sorting must prioritize the closest non-expired deadline.");
}

const originalOpportunity: Opportunity = sampleOpportunities[0];
const updatedOpportunity = applyStatusChange(originalOpportunity, "applying");

if (originalOpportunity.status === updatedOpportunity.status) {
  throw new Error("Status change must return an updated opportunity.");
}

if (originalOpportunity.status !== "priority") {
  throw new Error("Status change must not mutate the original opportunity.");
}
