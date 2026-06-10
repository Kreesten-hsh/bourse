import { buildScoreLines, formatScoreLine } from "./scoring-view-model";
import { sampleOpportunities } from "./sample-opportunities";

const daadOpportunity = sampleOpportunities.find((opportunity) => opportunity.id === "daad-epos-2027");

if (daadOpportunity === undefined) {
  throw new Error("DAAD sample opportunity must exist.");
}

const lines = buildScoreLines(daadOpportunity);
const fundingLine = lines.find((line) => line.key === "funding_full");

if (fundingLine === undefined || formatScoreLine(fundingLine) !== "+30 Entièrement financée") {
  throw new Error("Score breakdown must expose readable weighted reasons.");
}
