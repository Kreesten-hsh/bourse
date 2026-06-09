import type { Opportunity } from "@/types/opportunity";
import {
  formatDeadlineLabel,
  selectDefaultOpportunity,
  summarizeOpportunityBenefits
} from "./opportunity-view-model";

const priorityOpportunity: Opportunity = {
  id: "of-youth-cyber-fellowship-2026",
  title: "Cybersecurity Fellowship for African Students",
  organization: "Digital Resilience Initiative",
  programName: "African Cyber Fellows",
  sourceName: "Opportunities for Youth",
  sourceUrl: "https://opportunitiesforyouth.org/",
  officialApplicationUrl: "https://example.org/apply",
  collectedAt: "2026-06-09T18:00:00.000Z",
  updatedAt: "2026-06-09T18:00:00.000Z",
  type: "fellowship",
  domain: "cybersecurity",
  destinationCountry: "Rwanda",
  destinationCity: "Kigali",
  locationMode: "onsite",
  duration: "8 weeks",
  level: "student",
  deadline: "2026-07-02",
  deadlineConfidence: "confirmed",
  daysRemaining: 23,
  isExpired: false,
  fundingStatus: "fully_funded",
  fundingConfidence: "confirmed",
  benefits: [
    { label: "Monthly allowance", value: "USD 650", confirmed: true },
    { label: "Round-trip travel", value: "Covered", confirmed: true }
  ],
  eligibility: [
    { label: "Region", value: "Open to African applicants", blocking: false },
    { label: "Education", value: "Undergraduate students accepted", blocking: false }
  ],
  documents: [
    { label: "CV", status: "ready" },
    { label: "Motivation letter", status: "missing" }
  ],
  fitScore: 91,
  scoreBand: "priority",
  scoreExplanation: ["Fully funded", "Cybersecurity domain", "Open to African applicants"],
  matchedStrengths: ["FastAPI", "cybersecurity", "student profile"],
  blockingRisks: ["Motivation letter must be tailored"],
  applicationAngle: "Lead with Benin Cyber Shield and fraud detection experience.",
  status: "priority",
  notes: ""
};

const unknownDeadlineOpportunity: Opportunity = {
  ...priorityOpportunity,
  id: "unknown-deadline",
  title: "Software Training Program",
  deadline: null,
  deadlineConfidence: "unknown",
  daysRemaining: null,
  fitScore: 58,
  scoreBand: "low_priority",
  status: "to_analyze"
};

const selectedOpportunity = selectDefaultOpportunity([unknownDeadlineOpportunity, priorityOpportunity]);
const benefitSummary = summarizeOpportunityBenefits(priorityOpportunity);
const unknownDeadlineLabel = formatDeadlineLabel(unknownDeadlineOpportunity);

if (selectedOpportunity.id !== priorityOpportunity.id) {
  throw new Error("Default selection must prefer the highest score opportunity.");
}

if (benefitSummary !== "Monthly allowance: USD 650, Round-trip travel: Covered") {
  throw new Error("Benefit summary must expose concrete financial and travel support.");
}

if (unknownDeadlineLabel !== "Deadline a verifier") {
  throw new Error("Unknown deadlines must be explicit instead of looking confirmed.");
}
