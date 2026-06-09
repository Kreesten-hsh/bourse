export type OpportunityType =
  | "scholarship"
  | "internship"
  | "fellowship"
  | "training"
  | "job"
  | "volunteering"
  | "exchange"
  | "competition";

export type OpportunityDomain =
  | "software"
  | "cybersecurity"
  | "data"
  | "ai"
  | "digital_transformation"
  | "ict"
  | "open_source"
  | "product_engineering"
  | "devops";

export type LocationMode = "onsite" | "hybrid" | "remote";
export type OpportunityLevel = "student" | "graduate" | "professional" | "beginner" | "advanced";
export type DeadlineConfidence = "confirmed" | "inferred" | "unknown";
export type FundingStatus = "fully_funded" | "partially_funded" | "paid" | "unpaid" | "unknown";
export type FundingConfidence = "confirmed" | "partial" | "ambiguous" | "absent";
export type ScoreBand = "priority" | "analyze" | "low_priority" | "archive_candidate";
export type ApplicationStatus = "new" | "to_analyze" | "priority" | "preparing" | "applied" | "result" | "archived";
export type DocumentStatus = "ready" | "missing" | "optional" | "to_update";

export type OpportunityBenefit = Readonly<{
  label: string;
  value: string;
  confirmed: boolean;
}>;

export type EligibilityCondition = Readonly<{
  label: string;
  value: string;
  blocking: boolean;
}>;

export type DocumentRequirement = Readonly<{
  label: string;
  status: DocumentStatus;
}>;

export type Opportunity = Readonly<{
  id: string;
  title: string;
  organization: string;
  programName: string;
  sourceName: string;
  sourceUrl: string;
  officialApplicationUrl: string;
  collectedAt: string;
  updatedAt: string;
  type: OpportunityType;
  domain: OpportunityDomain;
  destinationCountry: string;
  destinationCity: string | null;
  locationMode: LocationMode;
  duration: string | null;
  level: OpportunityLevel;
  deadline: string | null;
  deadlineConfidence: DeadlineConfidence;
  daysRemaining: number | null;
  isExpired: boolean;
  fundingStatus: FundingStatus;
  fundingConfidence: FundingConfidence;
  benefits: ReadonlyArray<OpportunityBenefit>;
  eligibility: ReadonlyArray<EligibilityCondition>;
  documents: ReadonlyArray<DocumentRequirement>;
  fitScore: number;
  scoreBand: ScoreBand;
  scoreExplanation: ReadonlyArray<string>;
  matchedStrengths: ReadonlyArray<string>;
  blockingRisks: ReadonlyArray<string>;
  applicationAngle: string;
  status: ApplicationStatus;
  notes: string;
}>;
